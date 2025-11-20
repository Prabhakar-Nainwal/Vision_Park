// File: UserDashboard.jsx

"use client"

import { useState, useEffect } from "react"
import { Loader } from "lucide-react"
import { subscribeToZones } from "../services/socket"
import { vehicleAPI, zoneAPI, incomingVehicleAPI } from "../services/api"

// Import existing components
import ParkingCard from "../components/ParkingCard"
import PollutionMeter from "../components/PollutionMeter"
import StatsCards from "../components/StatsCards"

const Dashboard = () => {
  const [zones, setZones] = useState([])
  // Reverting to null to prevent displaying 0 while loading (as discussed previously)
  const [pollutionIndex, setPollutionIndex] = useState(null)
  const [fuelDistribution, setFuelDistribution] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    warned: 0,
    ignored: 0,
    avg_pollution: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await zoneAPI.getAll()
        if (response.success) {
          setZones(response.data)
        }
      } catch (error) {
        console.error("Error fetching zones:", error)
      }
    }

    const fetchAnalytics = async () => {
      try {
        const response = await vehicleAPI.getAnalytics()
        if (response.success) {
          const { fuelDistribution, pollutionIndex } = response.data

          if (fuelDistribution && fuelDistribution.length > 0) {
            const chartData = fuelDistribution.map((item) => ({
              name: item.fuel_type,
              value: item.count,
              color: item.fuel_type === "EV" ? "#10b981" : "#ef4444",
            }))
            setFuelDistribution(chartData)
          }

          // Ensure pollutionIndex is set correctly, defaulting to 21 (backend floor) if data is missing
          if (response.data.pollutionIndex !== undefined && response.data.pollutionIndex !== null) {
            setPollutionIndex(response.data.pollutionIndex)
          } else if (response.data) {
            setPollutionIndex(21) // Safe minimum value
          }
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      }
    }

    const fetchDailyStats = async () => {
      try {
        // Get all vehicles from today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split("T")[0]

        const response = await vehicleAPI.getAll({
          startDate: todayStr,
        })

        if (response.success) {
          const vehicles = response.data

          // Count today's stats from vehicle_logs
          const todayVehicles = vehicles.filter((v) => {
            const entryDate = new Date(v.entry_time)
            entryDate.setHours(0, 0, 0, 0)
            return entryDate.getTime() === today.getTime()
          })

          // Get incoming stats for additional data (ignored/warned)
          const incomingResponse = await incomingVehicleAPI.getStats()

          // FIX: Apply Number.parseInt to ensure numerical values
          const warnedCount = Number.parseInt(incomingResponse.data?.warned || 0);
          const ignoredCount = Number.parseInt(incomingResponse.data?.ignored || 0);

          setStats({
            total:
              todayVehicles.length +
              warnedCount +
              ignoredCount,
            allowed: todayVehicles.length,
            warned: warnedCount, // Storing the parsed number
            ignored: ignoredCount, // Storing the parsed number
            avg_pollution: incomingResponse.data?.avg_pollution || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching daily stats:", error)
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchZones(), fetchAnalytics(), fetchDailyStats()])
      setLoading(false)
    }

    loadData()

    const unsubscribeZones = subscribeToZones((updatedZone) => {
      // FIX: Merge the updatedZone data with the previous state (z)
      // This preserves static fields like latitude and longitude.
      setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? { ...z, ...updatedZone } : z)))
    })
    return () => {
      unsubscribeZones()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={48} className="text-blue-600 animate-spin" />
        <div className="ml-4 text-xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 space-y-6 pb-10">
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

      {/* Main Layout — cleaner responsive distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-[68%_32%] gap-10 items-start">


        {/* LEFT COLUMN (Parking Zones) */}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Parking Zone Overview</h2>

          {zones.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
              No parking zones configured
            </div>
          ) : (
            <div className="grid  grid-cols-1  sm:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-3 gap-5">
              {zones.map((zone) => (
                <div key={zone.id} className="w-full">
                  <ParkingCard zone={zone} />
                </div>
              ))}
            </div>
          )}
        </div>


        {/* RIGHT COLUMN (35%) */}
        <div className="min-w-0">
          {/* Conditional render for pollution meter to prevent initial 0 display */}
          {pollutionIndex !== null ? (
            <PollutionMeter pollutionIndex={pollutionIndex} fuelDistribution={fuelDistribution} />
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200 flex items-center justify-center h-48">
              <Loader size={24} className="text-blue-500 animate-spin mr-3" />
              <span className="text-gray-600">Calculating AQI...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard