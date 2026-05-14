import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ClipboardCheck, 
  Wrench,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import './DashboardView.css';

const SummaryCard = ({ title, value, change, icon: Icon, subtext, color, trend }) => (
  <div className={`summary-card ${color}`}>
    <div className="card-header">
      <div className="card-title">
        <h3>{title}</h3>
        <div className="value-group">
          <span className="value">{value}</span>
          <div className={`trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change}</span>
          </div>
        </div>
        <p className="subtext">{subtext}</p>
      </div>
      <div className="card-icon">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const DashboardView = ({ stats }) => {
  // Mock data for charts
  const growthData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 135 },
    { name: 'Mar', value: 150 },
    { name: 'Apr', value: 165 },
    { name: 'May', value: 180 },
    { name: 'Jun', value: 195 },
  ];

  const utilizationData = [
    { category: 'IT Equipment', value: 85 },
    { category: 'Furniture', value: 92 },
    { category: 'Vehicles', value: 65 },
    { category: 'Machinery', value: 88 },
    { category: 'Tools', value: 72 },
  ];

  const recentRequests = [
    { id: '1', user: 'Jayquel', type: 'Laptop Upgrade', date: '2 hours ago', status: 'Pending' },
    { id: '2', user: 'Sarah', type: 'New Monitor', date: '5 hours ago', status: 'Approved' },
    { id: '3', user: 'Mike', type: 'Office Chair', date: '1 day ago', status: 'Pending' },
  ];

  return (
    <div className="dashboard-view">
      <header className="view-header">
        <div className="greeting">
          <h1>Good evening, Jayquel</h1>
          <p>Here's an overview of your asset portfolio</p>
        </div>
        <div className="system-status">
          <span className="status-label">SYSTEM STATUS:</span>
          <span className="status-value">OPERATIONAL</span>
        </div>
      </header>

      <div className="alert-banner">
        <AlertCircle size={18} />
        <span>1 requests awaiting approval</span>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          title="TOTAL ASSETS"
          value={stats?.totalAssets || "6"}
          change="8.2%"
          trend="up"
          subtext="Tracked items"
          icon={Package}
          color="white"
        />
        <SummaryCard 
          title="PORTFOLIO VALUE"
          value="$13K"
          change="12.5%"
          trend="up"
          subtext="Total estimated"
          icon={DollarSign}
          color="white"
        />
        <SummaryCard 
          title="PENDING REQUESTS"
          value="1"
          change="3%"
          trend="down"
          subtext="Awaiting action"
          icon={ClipboardCheck}
          color="peach"
        />
        <SummaryCard 
          title="SCHEDULED MAINTENANCE"
          value="0"
          change="0"
          trend="up"
          subtext="Upcoming tasks"
          icon={Wrench}
          color="white"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-container line-chart">
          <h3>ASSET GROWTH TREND</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#427AB5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFE8BE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#427AB5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container bar-chart">
          <h3>UTILIZATION BY CATEGORY</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontSize: 11, fontWeight: 500}} />
                <Tooltip />
                <Bar dataKey="value" fill="#427AB5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Requests</h3>
            <button className="view-all">View all</button>
          </div>
          <table className="mini-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Request Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.user}</td>
                  <td>{req.type}</td>
                  <td>
                    <span className={`mini-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3>Upcoming Maintenance</h3>
            <button className="view-all">View all</button>
          </div>
          <div className="empty-maintenance">
            <Wrench size={40} color="#e2e8f0" />
            <p>No maintenance tasks scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
