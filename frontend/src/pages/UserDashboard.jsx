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
  const [pollutionIndex, setPollutionIndex] = useState(0)
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

          setPollutionIndex(pollutionIndex || 0)
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

          setStats({
            total:
              todayVehicles.length +
              Number.parseInt(incomingResponse.data?.warned || 0) +
              Number.parseInt(incomingResponse.data?.ignored || 0),
            allowed: todayVehicles.length,
            warned: incomingResponse.data?.warned || 0,
            ignored: incomingResponse.data?.ignored || 0,
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
      setZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)))
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
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time parking and pollution monitoring</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live System</span>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} period="today" />

      {/* Main Layout: Maintains 65% | 35% Split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] w-full gap-8 items-start">
        
        {/* LEFT COLUMN (65%) */}
        <div className="min-w-0"> {/* min-w-0 prevents flex/grid overflow issues */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Parking Zone Overview</h2>
          {zones.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
              No parking zones configured
            </div>
          ) : (
            // FIX: Changed from 3 columns to 2 columns. 
            // 3 columns inside a 65% container makes cards too thin/messy.
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {zones.map((zone) => (
                <ParkingCard key={zone.id} zone={zone} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="min-w-0">
          <PollutionMeter pollutionIndex={pollutionIndex} fuelDistribution={fuelDistribution} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard