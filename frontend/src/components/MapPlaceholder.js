/**
 * VELO - Route Map
 * Uses LogisticsMap with Leaflet + OpenStreetMap.
 * No Google Maps API key required.
 */

import React from 'react';
import LogisticsMap from './LogisticsMap';

export default function MapPlaceholder({ from, to }) {
  /* ========================================
     NO ROUTE INFORMATION
  ======================================== */

  if (!from || !to) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-content">
          <span className="map-placeholder-icon">
            🗺️
          </span>

          <p>
            <strong>Route Map Unavailable</strong>
          </p>

          <p>
            Pickup and destination are required.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================
     OPENSTREETMAP + LEAFLET
  ======================================== */

  return (
    <LogisticsMap
      pickupLocation={from}
      destination={to}
    />
  );
}