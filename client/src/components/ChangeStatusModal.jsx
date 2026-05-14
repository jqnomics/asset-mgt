import React, { useState } from 'react';
import axios from 'axios';
import './AddAssetForm.css'; // Re-use the modal styles from AddAssetForm

const ChangeStatusModal = ({ asset, onClose, onStatusChanged }) => {
  const [status, setStatus] = useState(asset.status);
  const [changeReason, setChangeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const statuses = ['In Stock', 'Deployed', 'Maintenance', 'Retired', 'Disposed', 'Lost', 'Requires Disposal'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      setError('Reason for change is required.');
      return;
    }
    if (status === asset.status) {
      setError('Please select a new status.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.put(`http://localhost:5000/api/assets/${asset.id}/status`, {
        status: status,
        change_reason: changeReason
      });
      
      if (response.data.requires_approval) {
        alert("Note: This status requires further approval workflows.");
      }

      onStatusChanged();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Change Asset Status</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-banner">{error}</div>}

        <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Updating status for <strong>{asset.property_number}</strong>
        </div>

        <form onSubmit={handleSubmit} className="asset-form">
          <div className="form-group">
            <label>New Status *</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reason for Change *</label>
            <textarea 
              value={changeReason} 
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Provide a required reason for this change..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                marginTop: '0.5rem'
              }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
