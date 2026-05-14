import React from 'react';
import StatusBadge from './StatusBadge';

const AssetRow = ({ asset, onOpenStatusModal }) => {
  return (
    <tr>
      <td>
        <strong style={{ color: '#fff' }}>{asset.property_number}</strong>
      </td>
      <td>{asset.model_name}</td>
      <td>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: 'var(--brand)', 
          backgroundColor: 'rgba(66, 122, 181, 0.1)',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {asset.asset_type}
        </span>
      </td>
      <td>{asset.division_name || 'Unassigned'}</td>
      <td>
        <StatusBadge status={asset.status} />
      </td>
      <td>
        {asset.custodian_name ? (
          <span style={{ color: '#fff' }}>{asset.custodian_name}</span>
        ) : (
          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>None</span>
        )}
      </td>
      <td>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          onClick={() => onOpenStatusModal(asset)}
        >
          Update Status
        </button>
      </td>
    </tr>
  );
};

export default AssetRow;
