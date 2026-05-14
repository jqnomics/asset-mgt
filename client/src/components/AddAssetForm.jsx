import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAssetForm.css';

const AddAssetForm = ({ onClose, onAssetAdded }) => {
  const [formData, setFormData] = useState({
    property_number: '',
    model_name: '',
    division_id: '',
    status: 'In Stock',
    custodian_id: '',
    procurement_id: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    // Fetch divisions for the dropdown
    axios.get('http://localhost:5000/api/divisions')
      .then(res => setDivisions(res.data))
      .catch(err => console.error("Failed to load divisions:", err));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.property_number.trim()) newErrors.property_number = 'Property Number is required.';
    if (!formData.model_name.trim()) newErrors.model_name = 'Asset Name is required.';
    if (!formData.division_id.trim()) newErrors.division_id = 'Office is required.';
    if (!formData.procurement_id.trim()) newErrors.procurement_id = 'Procurement ID is required by the API.';
    
    // UUID format validation for foreign keys
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (formData.procurement_id && !uuidRegex.test(formData.procurement_id)) {
      newErrors.procurement_id = 'Must be a valid UUID.';
    }
    if (formData.custodian_id && !uuidRegex.test(formData.custodian_id)) {
      newErrors.custodian_id = 'Must be a valid UUID.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await axios.post('http://localhost:5000/api/assets', {
        property_number: formData.property_number,
        model_name: formData.model_name,
        division_id: formData.division_id,
        procurement_id: formData.procurement_id
        // Note: Our API backend strictly enforces 'In Stock' status and handles 
        // custodian assignments as a secondary state transition.
      });
      onAssetAdded(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        // Backend returned a specific error (e.g. unique constraint or validation)
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: 'Failed to add asset. Check backend connection and Foreign Key UUIDs.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Register New Asset</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {errors.submit && <div className="error-banner">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="asset-form">
          <div className="form-group">
            <label>Property Number *</label>
            <input 
              type="text" 
              name="property_number" 
              value={formData.property_number} 
              onChange={handleChange} 
              placeholder="e.g. AST-2026-001"
            />
            {errors.property_number && <span className="field-error">{errors.property_number}</span>}
          </div>

          <div className="form-group">
            <label>Asset Name / Model *</label>
            <input 
              type="text" 
              name="model_name" 
              value={formData.model_name} 
              onChange={handleChange}
              placeholder="e.g. ThinkPad T14 Gen 4"
            />
            {errors.model_name && <span className="field-error">{errors.model_name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Office *</label>
              <select 
                name="division_id" 
                value={formData.division_id} 
                onChange={handleChange}
              >
                <option value="">-- Select Office --</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name} ({div.code})</option>
                ))}
              </select>
              {errors.division_id && <span className="field-error">{errors.division_id}</span>}
            </div>

            <div className="form-group">
              <label>Procurement UUID *</label>
              <input 
                type="text" 
                name="procurement_id" 
                value={formData.procurement_id} 
                onChange={handleChange}
                placeholder="00000000-0000..."
              />
              {errors.procurement_id && <span className="field-error">{errors.procurement_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} disabled title="API enforces 'In Stock' for new assets">
                <option value="In Stock">In Stock (Enforced)</option>
                <option value="Deployed">Deployed</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Custodian UUID (Optional)</label>
              <input 
                type="text" 
                name="custodian_id" 
                value={formData.custodian_id} 
                onChange={handleChange}
                placeholder="00000000-0000..."
                disabled title="Handled via Check-Out workflow"
              />
              {errors.custodian_id && <span className="field-error">{errors.custodian_id}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetForm;
