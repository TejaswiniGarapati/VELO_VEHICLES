/**
 * VELO - Logistics Route Map
 * Leaflet + OpenStreetMap + OSRM Road Routing
 * No Google Maps API key required.
 */

import React, { useEffect, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './LogisticsMap.css';

/* ========================================
   FIX LEAFLET DEFAULT MARKER ICON
======================================== */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ========================================
   FIT MAP TO ROAD ROUTE
======================================== */

function FitRoute({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      map.invalidateSize();

      map.fitBounds(positions, {
        padding: [50, 50],
      });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map, positions]);

  return null;
}

/* ========================================
   FIND LOCATION COORDINATES
======================================== */

async function findLocation(location) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
      location
    )}`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to search location "${location}"`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `Location "${location}" was not found`
    );
  }

  return [
    Number(data[0].lat),
    Number(data[0].lon),
  ];
}

/* ========================================
   LOGISTICS MAP COMPONENT
======================================== */

export default function LogisticsMap({
  pickupLocation,
  destination,
}) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);

  const [routePositions, setRoutePositions] =
    useState([]);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState('');

  /* ======================================
     LOAD LOCATIONS AND ROAD ROUTE
  ====================================== */

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!pickupLocation || !destination) {
        setMapError(
          'Pickup location and destination are required'
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setMapError('');

      setPickup(null);
      setDrop(null);

      setRoutePositions([]);

      setDistance(null);
      setDuration(null);

      try {
        /* FIND PICKUP */

        const pickupCoordinates =
          await findLocation(pickupLocation);

        /* FIND DESTINATION */

        const destinationCoordinates =
          await findLocation(destination);

        if (cancelled) {
          return;
        }

        setPickup(pickupCoordinates);
        setDrop(destinationCoordinates);

        /* ==================================
           PREPARE COORDINATES

           Leaflet:
           latitude, longitude

           OSRM:
           longitude, latitude
        ================================== */

        const pickupLat = pickupCoordinates[0];
        const pickupLon = pickupCoordinates[1];

        const destinationLat =
          destinationCoordinates[0];

        const destinationLon =
          destinationCoordinates[1];

        /* ==================================
           GET ROAD ROUTE FROM OSRM
        ================================== */

        const routeUrl =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${pickupLon},${pickupLat};` +
          `${destinationLon},${destinationLat}` +
          `?overview=full&geometries=geojson`;

        const routeResponse = await fetch(routeUrl);

        if (!routeResponse.ok) {
          throw new Error(
            'Unable to calculate road route'
          );
        }

        const routeData =
          await routeResponse.json();

        if (
          routeData.code !== 'Ok' ||
          !Array.isArray(routeData.routes) ||
          routeData.routes.length === 0
        ) {
          throw new Error(
            'Road route was not found'
          );
        }

        const route = routeData.routes[0];

        if (
          !route.geometry ||
          !Array.isArray(route.geometry.coordinates)
        ) {
          throw new Error(
            'Invalid road route data received'
          );
        }

        /* ==================================
           CONVERT OSRM GEOJSON TO LEAFLET
        ================================== */

        const leafletRoute =
          route.geometry.coordinates.map(
            ([longitude, latitude]) => [
              latitude,
              longitude,
            ]
          );

        if (cancelled) {
          return;
        }

        setRoutePositions(leafletRoute);

        /* DISTANCE: METERS TO KM */

        setDistance(
          (route.distance / 1000).toFixed(1)
        );

        /* DURATION: SECONDS TO HOURS */

        setDuration(
          Math.max(
            1,
            Math.round(route.duration / 3600)
          )
        );
      } catch (err) {
        console.error(
          'Logistics route error:',
          err
        );

        if (!cancelled) {
          setMapError(
            err.message ||
              'Unable to load transport road route'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [pickupLocation, destination]);

  /* ======================================
     LOADING STATE
  ====================================== */

  if (loading) {
    return (
      <div className="logistics-map-loading">
        <div className="map-loading-spinner" />

        <p>
          Calculating transport road route...
        </p>

        <span>
          {pickupLocation} → {destination}
        </span>
      </div>
    );
  }

  /* ======================================
     ERROR STATE
  ====================================== */

  if (
    mapError ||
    !pickup ||
    !drop ||
    routePositions.length === 0
  ) {
    return (
      <div className="logistics-map-error">
        <div className="map-error-icon">
          🗺️
        </div>

        <strong>
          Route Map Unavailable
        </strong>

        <p>
          {pickupLocation} → {destination}
        </p>

        <span>
          {mapError ||
            'Unable to calculate road route'}
        </span>
      </div>
    );
  }

  /* ======================================
     DISPLAY MAP
  ====================================== */

  return (
    <div className="logistics-map-container">
      {/* PICKUP AND DESTINATION */}

      <div className="logistics-map-header">
        <div>
          <span className="map-location-label">
            Pickup
          </span>

          <strong>
            📍 {pickupLocation}
          </strong>
        </div>

        <span className="map-route-arrow">
          →
        </span>

        <div>
          <span className="map-location-label">
            Destination
          </span>

          <strong>
            🏁 {destination}
          </strong>
        </div>
      </div>

      {/* ROUTE INFORMATION */}

      <div className="logistics-route-info">
        <div className="route-info-item">
          <span>
            Road Distance
          </span>

          <strong>
            {distance} KM
          </strong>
        </div>

        <div className="route-info-item">
          <span>
            Estimated Driving Time
          </span>

          <strong>
            {duration} Hours
          </strong>
        </div>
      </div>

      {/* MAP */}

      <div className="logistics-map-wrapper">
        <MapContainer
          center={pickup}
          zoom={6}
          scrollWheelZoom={true}
          className="logistics-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* PICKUP MARKER */}

          <Marker position={pickup}>
            <Popup>
              <strong>
                Pickup Location
              </strong>

              <br />

              {pickupLocation}
            </Popup>
          </Marker>

          {/* DESTINATION MARKER */}

          <Marker position={drop}>
            <Popup>
              <strong>
                Destination
              </strong>

              <br />

              {destination}
            </Popup>
          </Marker>

          {/* ROAD ROUTE */}

          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.9,
            }}
          />

          {/* FIT MAP */}

          <FitRoute positions={routePositions} />
        </MapContainer>
      </div>
    </div>
  );
}