import React, { useState, useEffect } from 'react'
import { Download, Loader } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { vehicleAPI } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const LogsReports = () => {
  const [vehicles, setVehicles] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, analyticsRes] = await Promise.all([
        vehicleAPI.getAll({}),
        vehicleAPI.getAnalytics(),
      ])

      if (vehiclesRes.success) setVehicles(vehiclesRes.data)

      if (analyticsRes.success && analyticsRes.data.dailyCount) {
        const formattedData = analyticsRes.data.dailyCount.map(item => ({
          day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          count: item.count,
          pollution: Math.round(item.avg_pollution),
        }))
        setTrendData(formattedData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Entry Time', 'Exit Time', 'Zone', 'Pollution Score']
    const rows = vehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.entry_time).toLocaleString(),
      v.exit_time ? new Date(v.exit_time).toLocaleString() : 'Still Inside',
      v.zone_name || 'N/A',
      v.pollution_score,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `traffic_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Traffic Optimization - Vehicle Logs Report', 14, 22)

    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    doc.setFontSize(12)
    doc.text(`Total Vehicles: ${vehicles.length}`, 14, 40)
    const evCount = vehicles.filter(v => v.fuel_type === 'EV').length
    const iceCount = vehicles.filter(v => v.fuel_type === 'ICE').length
    doc.text(`EV: ${evCount} | ICE: ${iceCount}`, 14, 47)

    const tableData = vehicles.slice(0, 50).map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      `${v.confidence}%`,
      new Date(v.entry_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      v.exit_time ? new Date(v.exit_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Inside',
      v.zone_name || 'N/A',
    ])

    autoTable(doc, {
      head: [['Plate', 'Category', 'Fuel', 'Conf.', 'Entry', 'Exit', 'Zone']],
      body: tableData,
      startY: 55,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    if (vehicles.length > 50) {
      const finalY = doc.lastAutoTable.finalY
      doc.text(`Showing first 50 of ${vehicles.length} vehicles`, 14, finalY + 10)
    }

    doc.save(`traffic_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <Loader size={48} className="text-blue-600 animate-spin mb-3" />
        <p className="text-slate-700 text-lg font-medium">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 py-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logs & Reports</h1>
          <p className="text-sm text-gray-500">Export and analyze daily traffic data and pollution trends</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:scale-[1.03] hover:bg-green-700 transition-all"
          >
            <Download size={16} className="mr-2" /> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:scale-[1.03] hover:bg-red-700 transition-all"
          >
            <Download size={16} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Charts Section */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md hover:scale-[1.01] transition-all">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Daily Vehicle Count</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md hover:scale-[1.01] transition-all">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Pollution Trends</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pollution" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vehicle Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-700">Recent Vehicle Logs</h2>
          <span className="text-xs text-gray-500">Showing latest entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Number Plate', 'Category', 'Fuel Type', 'Entry Time', 'Exit Time', 'Zone'].map(header => (
                  <th key={header} className="text-left px-4 py-3 font-semibold text-gray-600">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No vehicle logs found</td>
                </tr>
              ) : (
                vehicles.slice(0, 6).map(vehicle => (
                  <tr key={vehicle.id} className="border-b hover:bg-blue-50/50 transition-all">
                    <td className="px-4 py-3 font-mono">{vehicle.number_plate}</td>
                    <td className="px-4 py-3">{vehicle.vehicle_category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vehicle.fuel_type === 'EV'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(vehicle.entry_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vehicle.exit_time
                        ? new Date(vehicle.exit_time).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vehicle.zone_name || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LogsReports
