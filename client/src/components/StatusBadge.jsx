import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
  
  let statusClass = 'status-gray';
  if (normalizedStatus === 'deployed') statusClass = 'status-deployed';
  else if (normalizedStatus === 'maintenance') statusClass = 'status-maintenance';
  else if (normalizedStatus === 'instock') statusClass = 'status-instock';
  else if (normalizedStatus === 'lost') statusClass = 'status-purple';

  return (
    <span className={`status-badge ${statusClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
