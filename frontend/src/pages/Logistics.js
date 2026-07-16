/**
 * Logistics (Import / Export) - Only visible if user selected Transport or Goods Carrier.
 * Import: name, item, weight, vehicle reg, from, to, Book Slot / Cancel. After booking show route on map.
 * Export: name, delivery address, delivery date, complete within 5 days; delay = extra payment per delayed day.
 */
import React, { useState } from 'react';
import MapPlaceholder from '../components/MapPlaceholder';
import { useAuth } from '../context/AuthContext';
import { getVehicleVisibility } from '../utils/vehicleVisibility';
import './Logistics.css';

export default function Logistics() {
  const { user } = useAuth();
  const visibility = getVehicleVisibility(user);

  const [importForm, setImportForm] = useState({
    importName: '',
    itemName: '',
    weight: '',
    vehicleRegNo: user?.vehicleNumber || '',
    fromLocation: '',
    toLocation: '',
  });
  const [importBooked, setImportBooked] = useState(null);
  const [exportForm, setExportForm] = useState({
    exportName: '',
    deliveryAddress: '',
    deliveryDate: '',
  });
  const [exportBooked, setExportBooked] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const handleImportChange = (e) => {
    const { name, value } = e.target;
    setImportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExportChange = (e) => {
    const { name, value } = e.target;
    setExportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportBookSlot = (e) => {
    e.preventDefault();
    if (!importForm.importName || !importForm.fromLocation || !importForm.toLocation) return;
    setImportBooked({ ...importForm });
    setShowMap(true);
  };

  const handleImportCancel = () => {
    setImportBooked(null);
    setImportForm({ importName: '', itemName: '', weight: '', vehicleRegNo: '', fromLocation: '', toLocation: '' });
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    if (!exportForm.exportName || !exportForm.deliveryAddress || !exportForm.deliveryDate) return;
    setExportBooked({ ...exportForm });
  };

  if (!visibility.showLogistics) {
    return (
      <div className="container page-container">
        <h1 className="page-title">Logistics (Import / Export)</h1>
        <div className="card">
          <p>Logistics module is unavailable for your selected vehicle profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container">
      <h1 className="page-title">Logistics (Import / Export)</h1>

      <div className="logistics-grid">
        {/* Import Section */}
        <div className="logistics-section card">
          <h3>Import</h3>
          <form onSubmit={handleImportBookSlot}>
            <div className="form-group">
              <label>Import name</label>
              <input name="importName" value={importForm.importName} onChange={handleImportChange} placeholder="Import name" />
            </div>
            <div className="form-group">
              <label>Item name</label>
              <input name="itemName" value={importForm.itemName} onChange={handleImportChange} placeholder="Item name" />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input name="weight" type="text" value={importForm.weight} onChange={handleImportChange} placeholder="e.g. 100 kg" />
            </div>
            <div className="form-group">
              <label>Vehicle registration number</label>
              <input name="vehicleRegNo" value={importForm.vehicleRegNo} onChange={handleImportChange} placeholder="e.g. KA01AB1234" />
            </div>
            <div className="form-group">
              <label>From location</label>
              <input name="fromLocation" value={importForm.fromLocation} onChange={handleImportChange} placeholder="From" required />
            </div>
            <div className="form-group">
              <label>To location</label>
              <input name="toLocation" value={importForm.toLocation} onChange={handleImportChange} placeholder="To" required />
            </div>
            <div className="logistics-actions">
              <button type="submit" className="btn btn-primary">Book Slot</button>
              <button type="button" className="btn btn-secondary" onClick={handleImportCancel}>Cancel</button>
            </div>
          </form>
          {importBooked && (
            <div className="logistics-booked">
              <strong>Slot booked.</strong> From: {importBooked.fromLocation} → To: {importBooked.toLocation}
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="logistics-section card">
          <h3>Export</h3>
          <p className="hint">Delivery must complete within 5 days. Extra payment per delayed day after delivery date.</p>
          <form onSubmit={handleExportSubmit}>
            <div className="form-group">
              <label>Export name</label>
              <input name="exportName" value={exportForm.exportName} onChange={handleExportChange} placeholder="Export name" required />
            </div>
            <div className="form-group">
              <label>Delivery address</label>
              <input name="deliveryAddress" value={exportForm.deliveryAddress} onChange={handleExportChange} placeholder="Full address" required />
            </div>
            <div className="form-group">
              <label>Delivery date</label>
              <input name="deliveryDate" type="date" value={exportForm.deliveryDate} onChange={handleExportChange} required />
            </div>
            <button type="submit" className="btn btn-primary">Submit Export</button>
          </form>
          {exportBooked && (
            <div className="logistics-booked">
              <strong>Export recorded.</strong> Delivery by {exportBooked.deliveryDate}. Complete within 5 days.
            </div>
          )}
        </div>
      </div>

      {/* Map - show route after import slot booking */}
      {showMap && importBooked && (
        <div className="logistics-map-section card">
          <h3>Route: {importBooked.fromLocation} → {importBooked.toLocation}</h3>
          <MapPlaceholder from={importBooked.fromLocation} to={importBooked.toLocation} />
        </div>
      )}
    </div>
  );
}
