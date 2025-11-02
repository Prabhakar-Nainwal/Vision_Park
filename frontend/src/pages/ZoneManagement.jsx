"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader, MapPin, AlertCircle, CheckCircle, TrendingUp } from "lucide-react"
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

  const handleDeleteZone = async (id) => {
    if (window.confirm("Are you sure you want to delete this parking zone?")) {
      try {
        const response = await zoneAPI.delete(id)
        if (response.success) {
          await fetchZones()
        }
      } catch (error) {
        console.error("Error deleting zone:", error)
        alert("Failed to delete zone")
      }
    }
  }

  useEffect(() => {
    fetchZones()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="relative w-14 h-14 mb-6">
          <Loader size={56} className="text-blue-600 animate-spin" />
        </div>
        <p className="text-lg font-semibold text-slate-700">Loading parking zones...</p>
        <p className="text-sm text-slate-500 mt-2">Please wait</p>
      </div>
    )
  }

  const getStatusInfo = (zone) => {
    const occupancyPercent = zone.occupancyPercentage
    const threshold = zone.thresholdPercentage

    if (occupancyPercent >= threshold) {
      return {
        color: "from-red-500 to-red-600",
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        status: "Full",
        icon: AlertCircle,
      }
    } else if (occupancyPercent >= threshold - 20) {
      return {
        color: "from-amber-500 to-amber-600",
        textColor: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        status: "Nearly Full",
        icon: AlertCircle,
      }
    }
    return {
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      status: "Available",
      icon: CheckCircle,
    }
  }

  return (
    <div className="min-h-screen bg-white p-5 sm:p-6 lg:p-8">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800">Parking Zones Management</h1>
            <p className="text-sm text-slate-600 mt-1">Real-time monitoring and management of all parking zones in your facility</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.03] transition-all active:scale-95"
            title="Add New Zone"
          >
            <Plus size={18} />
            <span>Add New Zone</span>
          </button>
        </div>

        {/* Stats */}
        {zones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 font-medium">Total Zones</p>
                <MapPin size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{zones.length}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 font-medium">Total Capacity</p>
                <TrendingUp size={16} className="text-cyan-600" />
              </div>
              <p className="text-2xl font-bold text-cyan-600">{zones.reduce((acc, z) => acc + z.totalSlots, 0)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 font-medium">Currently Occupied</p>
                <TrendingUp size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{zones.reduce((acc, z) => acc + z.occupiedSlots, 0)}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 font-medium">Available Slots</p>
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{zones.reduce((acc, z) => acc + z.availableSlots, 0)}</p>
            </div>
          </div>
        )}

        {/* Zones Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
          {zones.length === 0 ? (
            <div className="col-span-full">
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="mb-4 p-3 bg-slate-100 rounded-xl">
                  <MapPin size={48} className="text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-slate-700 mb-2">No parking zones yet</p>
                <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">Get started by creating your first parking zone to begin monitoring</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:scale-[1.03] transition-all"
                >
                  Create First Zone
                </button>
              </div>
            </div>
          ) : (
            zones.map((zone) => {
              const statusInfo = getStatusInfo(zone)
              const StatusIcon = statusInfo.icon
              const occupancyPercent = zone.occupancyPercentage

              return (
                <div
                  key={zone.id}
                  className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01]"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${statusInfo.color}`} />

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-slate-900">{zone.name}</h3>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                            <StatusIcon size={14} className={statusInfo.textColor} />
                            <span className={`text-xs font-semibold ${statusInfo.textColor}`}>{statusInfo.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <MapPin size={14} />
                          <span>{zone.location || "No location specified"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingZone(zone)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                          title="Edit zone"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                          title="Delete zone"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Occupancy Rate</span>
                        <span className={`text-lg font-bold ${statusInfo.textColor}`}>{occupancyPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div
                          className={`h-full bg-gradient-to-r ${statusInfo.color} transition-all duration-500`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-all">
                        <p className="text-xs text-slate-600 font-medium mb-1">Total Capacity</p>
                        <p className="text-lg font-bold text-slate-900">{zone.totalSlots}</p>
                        <p className="text-xs text-slate-500 mt-1">parking slots</p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 hover:border-emerald-300 transition-all">
                        <p className="text-xs text-emerald-700 font-medium mb-1">Available</p>
                        <p className="text-lg font-bold text-emerald-600">{zone.availableSlots}</p>
                        <p className="text-xs text-emerald-600 mt-1">ready to use</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:border-blue-300 transition-all">
                        <p className="text-xs text-blue-700 font-medium mb-1">Occupied</p>
                        <p className="text-lg font-bold text-blue-600">{zone.occupiedSlots}</p>
                        <p className="text-xs text-blue-600 mt-1">in use now</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 hover:border-amber-300 transition-all">
                        <p className="text-xs text-amber-700 font-medium mb-1">Alert Level</p>
                        <p className="text-lg font-bold text-amber-600">{zone.thresholdPercentage}%</p>
                        <p className="text-xs text-amber-600 mt-1">threshold</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all border border-slate-200">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Create New Zone</h2>
              <p className="text-sm text-slate-600 mt-1">Add a new parking zone to your management system</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                  placeholder="e.g., Zone D, North Wing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={newZone.totalSlots}
                  onChange={(e) => setNewZone({ ...newZone, totalSlots: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newZone.location}
                  onChange={(e) => setNewZone({ ...newZone, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                  placeholder="e.g., West Wing, Building A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alert Threshold % *</label>
                <input
                  type="number"
                  value={newZone.thresholdPercentage}
                  onChange={(e) => setNewZone({ ...newZone, thresholdPercentage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                  placeholder="e.g., 90"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={handleAddZone}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-md hover:shadow-md transform hover:scale-[1.03] transition-all active:scale-95 text-sm"
              >
                Create Zone
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-300 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all border border-slate-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Edit Zone Details</h2>
              <p className="text-sm text-slate-600 mt-1">Update zone configuration and settings</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Capacity *</label>
                <input
                  type="number"
                  value={editingZone.totalSlots}
                  onChange={(e) => setEditingZone({ ...editingZone, totalSlots: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editingZone.location}
                  onChange={(e) => setEditingZone({ ...editingZone, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alert Threshold % *</label>
                <input
                  type="number"
                  value={editingZone.thresholdPercentage}
                  onChange={(e) => setEditingZone({ ...editingZone, thresholdPercentage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-md focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all text-slate-900 text-sm"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={handleUpdateZone}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-md hover:shadow-md transform hover:scale-[1.03] transition-all active:scale-95 text-sm"
              >
                Update Zone
              </button>
              <button
                onClick={() => setEditingZone(null)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-300 transition-all text-sm"
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
