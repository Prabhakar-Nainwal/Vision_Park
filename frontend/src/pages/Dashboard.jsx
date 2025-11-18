import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { subscribeToIncomingVehicles, subscribeToZones } from '../services/socket';
import { vehicleAPI, zoneAPI, incomingVehicleAPI } from '../services/api';

// Import existing components
import LiveFeed from '../components/LiveFeed';
import FuelDistribution from '../components/FuelDistribution';
import StatsCards from '../components/StatsCards';

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [incomingVehicles, setIncomingVehicles] = useState([]);
  const [pollutionIndex, setPollutionIndex] = useState(0);
  const [fuelDistribution, setFuelDistribution] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    warned: 0,
    ignored: 0,
    avg_pollution: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await zoneAPI.getAll();
        if (response.success) {
          setZones(response.data);
        }
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const response = await vehicleAPI.getAnalytics();
        if (response.success) {
          const { fuelDistribution, pollutionIndex } = response.data;

          if (fuelDistribution && fuelDistribution.length > 0) {
            const chartData = fuelDistribution.map(item => ({
              name: item.fuel_type,
              value: item.count,
              color: item.fuel_type === 'EV' ? '#10b981' : '#ef4444'
            }));
            setFuelDistribution(chartData);
          }

          setPollutionIndex(pollutionIndex || 0);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    const fetchDailyStats = async () => {
      try {
        // Get all vehicles from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const response = await vehicleAPI.getAll({
          startDate: todayStr
        });

        if (response.success) {
          const vehicles = response.data;

          // Count today's stats from vehicle_logs
          // Since incoming_vehicles table only shows last hour stats,
          // we calculate from vehicle_logs for daily view
          const todayVehicles = vehicles.filter(v => {
            const entryDate = new Date(v.entry_time);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
          });

          // Get incoming stats for additional data (ignored/warned)
          const incomingResponse = await incomingVehicleAPI.getStats();

          setStats({
            total: todayVehicles.length + parseInt(incomingResponse.data?.warned || 0) + parseInt(incomingResponse.data?.ignored || 0),
            allowed: todayVehicles.length, // All in vehicle_logs are allowed
            warned: incomingResponse.data?.warned || 0,
            ignored: incomingResponse.data?.ignored || 0,
            avg_pollution: incomingResponse.data?.avg_pollution || 0
          });
        }
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchZones(), fetchAnalytics(), fetchDailyStats()]);
      setLoading(false);
    };

    loadData();

    const unsubscribeIncoming = subscribeToIncomingVehicles((newVehicle) => {
      setIncomingVehicles(prev => {
        const exists = prev.some(v => v.id === newVehicle.id);
        if (exists) return prev;
        const vehicleWithTimestamp = { ...newVehicle, displayTime: new Date().getTime() };
        return [vehicleWithTimestamp, ...prev];
      });
      fetchAnalytics();
      fetchZones();
      fetchDailyStats();
    });

    const unsubscribeZones = subscribeToZones((updatedZone) => {
      setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
    });

    const cleanupInterval = setInterval(() => {
      const now = new Date().getTime();
      setIncomingVehicles(prev =>
        prev.filter(v => {
          const displayTime = v.displayTime || new Date(v.detected_time).getTime();
          const age = now - displayTime;
          return age < 120000;
        })
      );
    }, 1000);

    return () => {
      unsubscribeIncoming();
      unsubscribeZones();
      clearInterval(cleanupInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={48} className="text-blue-600 animate-spin" />
        <div className="ml-4 text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1 font-medium">
            Real-time parking and pollution monitoring
          </p>
          <div className="w-20 h-[3px] mt-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"></div>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live System</span>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} period="today" />



      {/* Real-time Feed and Pollution Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveFeed incomingVehicles={incomingVehicles} />
        <FuelDistribution pollutionIndex={pollutionIndex} fuelDistribution={fuelDistribution} />
      </div>

    </div>
  );
};

export default Dashboard;