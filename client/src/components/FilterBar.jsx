import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const FilterBar = ({ onSearch, onStatusChange, onTypeChange, searchQuery, statusFilter, typeFilter }) => {
  return (
    <div className="modern-filter-bar">
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          className="modern-filter-input" 
          value={searchQuery}
          placeholder="Search inventory by serial, name, or office..." 
          onChange={(e) => onSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => onSearch('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="filter-group">
        <div className="select-wrapper">
          <Filter className="select-icon" size={16} />
          <select 
            className="modern-filter-select" 
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Deployed">Deployed</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="select-wrapper">
          <Filter className="select-icon" size={16} />
          <select 
            className="modern-filter-select" 
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
            <option value="Peripheral">Peripheral</option>
            <option value="Software">Software</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
