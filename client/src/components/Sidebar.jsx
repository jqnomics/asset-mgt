import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Wrench, 
  Trash2, 
  BarChart3, 
  RefreshCw, 
  Settings 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'OPERATIONS' },
    { id: 'assets', label: 'Assets', icon: Package, category: 'OPERATIONS' },
    { id: 'requests', label: 'Requests', icon: ClipboardList, category: 'OPERATIONS' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, category: 'OPERATIONS' },
    { id: 'disposal', label: 'Disposal', icon: Trash2, category: 'ANALYTICS & CONFIG' },
    { id: 'reports', label: 'Reports', icon: BarChart3, category: 'ANALYTICS & CONFIG' },
    { id: 'lifecycle', label: 'Lifecycle', icon: RefreshCw, category: 'ANALYTICS & CONFIG' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'ANALYTICS & CONFIG' },
  ];

  const categories = ['OPERATIONS', 'ANALYTICS & CONFIG'];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Package size={24} color="#fff" />
        </div>
        <div className="logo-text">
          <h1>Asset Manager</h1>
          <span>INVENTORY CONTROL</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {categories.map(category => (
          <div key={category} className="nav-section">
            <h3 className="nav-category">{category}</h3>
            {menuItems
              .filter(item => item.category === category)
              .map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon size={20} className="nav-icon" />
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
