import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import AssetInventory from './components/AssetInventory';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({
    totalAssets: 0,
    portfolioValue: '$0',
    pendingRequests: 0,
    scheduledMaintenance: 0
  });

  useEffect(() => {
    // Fetch basic stats for the dashboard
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        setStats(prev => ({
          ...prev,
          totalAssets: response.data.length
        }));
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView stats={stats} />;
      case 'assets':
        return <AssetInventory />;
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <h2>{activeView.toUpperCase()}</h2>
            <p>This view is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Layout>
  );
}

export default App;
