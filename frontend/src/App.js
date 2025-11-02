import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import VehicleManagement from './pages/VehicleManagement';
import ZoneManagement from './pages/ZoneManagement';
import LogsReports from './pages/LogsReports';
import TrafficAnalytics from './pages/TrafficAnalytics';
import Login from './pages/Login';
import Settings from './pages/Settings';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (<Router> <AppContent token={token} handleLogout={handleLogout} handleLogin={handleLogin} /> </Router>
  );
}

function AppContent({ token, handleLogout, handleLogin }) {
  const location = useLocation();

  // Hide Navbar only on login page
  const hideNavbar = location.pathname === '/login';

  return (<div className="flex h-screen bg-gray-100">
    {!hideNavbar && <Navbar onLogout={handleLogout} token={token} />}

    
    <div className="flex-1 overflow-auto p-8">
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={token ? <Dashboard /> : <UserDashboard />} />
        <Route path="/traffic" element={<TrafficAnalytics />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected Pages */}
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute token={token}>
              <VehicleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones"
          element={
            <ProtectedRoute token={token}>
              <ZoneManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute token={token}>
              <LogsReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute token={token}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </div>

  );
}

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default App;
