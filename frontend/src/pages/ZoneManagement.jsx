import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader, MapPin, AlertCircle, CheckCircle, TrendingUp, X, Building2, Activity, BarChart3, Clock, Search, Filter, MoreVertical, Zap, Users, Eye } from "lucide-react"

// Simulated API (same as before)
import { zoneAPI } from "../services/api.js"

const ZoneManagement = () => {
  const [zones, setZones] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [newZone, setNewZone] = useState({
    name: "",
    totalSlots: "",
    location: "",
    thresholdPercentage: "90",
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteZoneId, setDeleteZoneId] = useState(null);
  const [deleteZoneName, setDeleteZoneName] = useState("");


  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await zoneAPI.getAll()
      if (response.success) {
        setZones(response.data)
      }
    } catch (error) {
      console.error("Error fetching zones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddZone = async () => {
    if (newZone.name && newZone.totalSlots) {
      try {
        const response = await zoneAPI.create({
          name: newZone.name,
          totalSlots: Number.parseInt(newZone.totalSlots),
          location: newZone.location,
          thresholdPercentage: Number.parseInt(newZone.thresholdPercentage),
        })

        if (response.success) {
          await fetchZones()
          setNewZone({ name: "", totalSlots: "", location: "", thresholdPercentage: "90" })
          setShowAddModal(false)
        }
      } catch (error) {
        console.error("Error adding zone:", error)
        alert("Failed to add zone. Please check if the name already exists.")
      }
    } else {
      alert("Please fill in all required fields")
    }
  }

  const handleUpdateZone = async () => {
    if (editingZone && editingZone.name && editingZone.totalSlots) {
      try {
        const response = await zoneAPI.update(editingZone.id, {
          name: editingZone.name,
          totalSlots: Number.parseInt(editingZone.totalSlots),
          location: editingZone.location,
          thresholdPercentage: Number.parseInt(editingZone.thresholdPercentage),
        })

        if (response.success) {
          await fetchZones()
          setEditingZone(null)
        }
      } catch (error) {
        console.error("Error updating zone:", error)
        alert("Failed to update zone")
      }
    }
  }

  const confirmDeleteZone = async () => {
    try {
      const response = await zoneAPI.delete(deleteZoneId);
      if (response.success) {
        await fetchZones();
        setDeleteZoneId(null);
        setDeleteZoneName("");
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
      alert("Failed to delete zone");
    }
  };


  useEffect(() => {
    fetchZones()
  }, [])

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-violet-500 rounded-full animate-spin"></div>
          <Zap size={28} className="text-violet-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-lg font-semibold text-gray-800 mt-6">Loading Dashboard</p>
        <p className="text-sm text-gray-500 mt-2">Fetching real-time data...</p>
      </div>
    )
  }

  const getStatusInfo = (zone) => {
    const occupancyPercent = zone.occupancyPercentage
    const threshold = zone.thresholdPercentage

    if (occupancyPercent >= threshold) {
      return {
        gradient: "from-red-500/10 via-red-500/5 to-transparent",
        barColor: "from-red-500 to-rose-600",
        textColor: "text-red-600",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        glowColor: "shadow-red-500/20",
        status: "Critical",
        icon: AlertCircle,
      }
    } else if (occupancyPercent >= threshold - 20) {
      return {
        gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
        barColor: "from-amber-500 to-orange-600",
        textColor: "text-amber-600",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        glowColor: "shadow-amber-500/20",
        status: "Warning",
        icon: Activity,
      }
    }
    return {
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      barColor: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      glowColor: "shadow-emerald-500/20",
      status: "Optimal",
      icon: CheckCircle,
    }
  }

  const totalCapacity = zones.reduce((acc, z) => acc + z.totalSlots, 0)
  const totalOccupied = zones.reduce((acc, z) => acc + z.occupiedSlots, 0)
  const totalAvailable = zones.reduce((acc, z) => acc + z.availableSlots, 0)
  const avgOccupancy = zones.length > 0 ? Math.round(zones.reduce((acc, z) => acc + z.occupancyPercentage, 0) / zones.length) : 0

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-2 mb-6">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                    Parking Zones Management
                  </h1>
                  <p className="text-gray-600 text-sm mt-1 font-medium">
                    Real-time parking management system
                  </p>
                  <div className="w-20 h-[3px] mt-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"></div>
                </div>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:flex-none lg:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search zones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Zone</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {zones.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-violet-400 transition-all overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-violet-100 rounded-lg border border-violet-200">
                    <BarChart3 size={20} className="text-violet-600" />
                  </div>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Zones</p>
                <p className="text-3xl font-bold text-gray-900">{zones.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active facilities</p>
              </div>
            </div>

            <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-400 transition-all overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-cyan-100 rounded-lg border border-cyan-200">
                    <Building2 size={20} className="text-cyan-600" />
                  </div>
                  <Activity size={16} className="text-cyan-600" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Capacity</p>
                <p className="text-3xl font-bold text-gray-900">{totalCapacity}</p>
                <p className="text-xs text-gray-500 mt-1">Available spaces</p>
              </div>
            </div>

            <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-200">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <Eye size={16} className="text-emerald-600" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Available Now</p>
                <p className="text-3xl font-bold text-gray-900">{totalAvailable}</p>
                <p className="text-xs text-gray-500 mt-1">Ready to park</p>
              </div>
            </div>

            <div className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-400 transition-all overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg border border-amber-200">
                    <Activity size={20} className="text-amber-600" />
                  </div>
                  <Users size={16} className="text-amber-600" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Avg Occupancy</p>
                <p className="text-3xl font-bold text-gray-900">{avgOccupancy}%</p>
                <p className="text-xs text-gray-500 mt-1">Across all zones</p>
              </div>
            </div>
          </div>
        )}

        {/* Zones Grid */}
        {filteredZones.length === 0 && zones.length === 0 ? (
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
            <div className="relative">
              <div className="inline-flex p-5 bg-gray-100 rounded-2xl border border-gray-200 mb-6">
                <MapPin size={56} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Zones Configured</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Start by creating your first parking zone to begin monitoring and managing your facility</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
              >
                <Plus size={20} />
                Create First Zone
              </button>
            </div>
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Search size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No zones match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredZones.map((zone) => {
              const statusInfo = getStatusInfo(zone)
              const StatusIcon = statusInfo.icon
              const occupancyPercent = zone.occupancyPercentage

              return (
                <div
                  key={zone.id}
                  className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all shadow-sm hover:shadow-lg"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${statusInfo.gradient} opacity-70`} />

                  {/* Content */}
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-md`}>
                            <StatusIcon size={14} className={statusInfo.textColor} />
                            <span className={`text-xs font-semibold ${statusInfo.textColor}`}>{statusInfo.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin size={14} />
                          <span>{zone.location || "Location not set"}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingZone(zone)}
                          className="p-2 bg-white hover:bg-violet-100 border border-gray-300 text-gray-500 hover:text-violet-600 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteZoneId(zone.id);
                            setDeleteZoneName(zone.name);
                          }}

                          className="p-2 bg-white hover:bg-red-100 border border-gray-300 text-gray-500 hover:text-red-600 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - occupancyPercent / 100)}`}
                            className="transition-all duration-1000"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" className={statusInfo.textColor} />
                              <stop offset="100%" className={statusInfo.textColor} style={{ opacity: 0.6 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-bold ${statusInfo.textColor}`}>{occupancyPercent}%</span>
                          <span className="text-xs text-gray-500 mt-1">Occupied</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{zone.totalSlots}</p>
                        <p className="text-xs text-gray-500 mt-1">Total</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{zone.availableSlots}</p>
                        <p className="text-xs text-emerald-600 mt-1">Free</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{zone.thresholdPercentage}%</p>
                        <p className="text-xs text-gray-500 mt-1">Alert</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="relative bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Zone</h2>
                  <p className="text-sm text-gray-500 mt-1">Add a parking zone to your system</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="e.g., Zone A, North Parking"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={newZone.totalSlots}
                  onChange={(e) => setNewZone({ ...newZone, totalSlots: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone({ ...newZone, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="e.g., West Wing, Building A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Threshold (%) *</label>
                <input
                  type="number"
                  value={newZone.thresholdPercentage}
                  onChange={(e) => setNewZone({ ...newZone, thresholdPercentage: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="e.g., 90"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleAddZone}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-500/30 transition-all"
              >
                Create Zone
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Zone</h2>
                  <p className="text-sm text-gray-500 mt-1">Update zone configuration</p>
                </div>
                <button
                  onClick={() => setEditingZone(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={editingZone.totalSlots}
                  onChange={(e) => setEditingZone({ ...editingZone, totalSlots: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editingZone.location}
                  onChange={(e) => setEditingZone({ ...editingZone, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="e.g., West Wing, Building A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Threshold (%) *</label>
                <input
                  type="number"
                  value={editingZone.thresholdPercentage}
                  onChange={(e) => setEditingZone({ ...editingZone, thresholdPercentage: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="e.g., 90"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleUpdateZone}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all"
              >
                Update Zone
              </button>
              <button
                onClick={() => setEditingZone(null)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteZoneId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="relative bg-gradient-to-r from-red-500/10 to-rose-500/10 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Delete Zone</h2>
                <button
                  onClick={() => setDeleteZoneId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 text-center space-y-4">
              <AlertCircle className="mx-auto text-red-500" size={48} />
              <h3 className="text-lg font-semibold text-gray-800">
                Are you sure you want to delete <span className="text-red-600">{deleteZoneName}</span>?
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All data for this zone will be permanently removed.
              </p>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={confirmDeleteZone}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteZoneId(null)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ZoneManagement