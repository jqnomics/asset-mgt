import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, activeView, onViewChange }) => {
  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
