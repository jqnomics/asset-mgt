import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssetRow from './AssetRow';
import FilterBar from './FilterBar';
import AddAssetForm from './AddAssetForm';
import ChangeStatusModal from './ChangeStatusModal';
import './AssetInventory.css';

const AssetInventory = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusModalAsset, setStatusModalAsset] = useState(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, typeFilter]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('asset_type', typeFilter);
      
      const url = `http://localhost:5000/api/assets?${params.toString()}`;
        
      const response = await axios.get(url);
      setAssets(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("Failed to load inventory. Please ensure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side search filtering (for name, property number, etc)
  const filteredAssets = assets.filter(asset => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      asset.property_number?.toLowerCase().includes(query) ||
      asset.model_name?.toLowerCase().includes(query) ||
      asset.asset_type?.toLowerCase().includes(query) ||
      asset.custodian_name?.toLowerCase().includes(query) ||
      asset.division_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">IT Asset Management</h1>
          <p className="dashboard-subtitle">Track, manage, and audit organizational hardware across all divisions.</p>
        </div>
        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          + Add New Asset
        </button>
      </div>

      <div className="table-panel">
        <FilterBar 
          onSearch={setSearchQuery} 
          onStatusChange={setStatusFilter} 
          onTypeChange={setTypeFilter}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
        />
        
        {loading ? (
          <div className="loading-state">Loading assets...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredAssets.length === 0 ? (
          <div className="empty-state">No assets found matching your criteria.</div>
        ) : (
          <table className="asset-table">
            <thead>
              <tr>
                <th>Property Number</th>
                <th>Name / Model</th>
                <th>Type</th>
                <th>Office</th>
                <th>Status</th>
                <th>Custodian</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <AssetRow 
                  key={asset.id} 
                  asset={asset} 
                  onOpenStatusModal={setStatusModalAsset}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddAssetForm 
          onClose={() => setIsModalOpen(false)} 
          onAssetAdded={fetchAssets} 
        />
      )}

      {statusModalAsset && (
        <ChangeStatusModal
          asset={statusModalAsset}
          onClose={() => setStatusModalAsset(null)}
          onStatusChanged={fetchAssets}
        />
      )}
    </div>
  );
};

export default AssetInventory;
