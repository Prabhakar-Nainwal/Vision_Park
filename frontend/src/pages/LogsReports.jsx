import React, { useState, useEffect } from 'react'
import { Download, Loader, ChevronLeft, ChevronRight, Search, RefreshCw, Activity, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { incomingVehicleAPI } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const LogsReports = () => {
  const [vehicles, setVehicles] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  })

  // Added Date Range State
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchData = async (page = 1, isBackground = false) => {
    try {
      if (isBackground) {
        setIsFetching(true)
      } else {
        setLoading(true)
      }

      const [vehiclesRes, analyticsRes] = await Promise.all([
        incomingVehicleAPI.getHistory({
          page: page,
          limit: pagination.limit,
          search: searchTerm,
          startDate: dateRange.startDate, // Pass start date
          endDate: dateRange.endDate      // Pass end date
        }),
        page === 1 ? incomingVehicleAPI.getAnalytics() : Promise.resolve({ success: false })
      ])

      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data)
        setPagination(prev => ({
          ...prev,
          ...vehiclesRes.pagination
        }))
      }

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
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !isFetching) {
      fetchData(newPage, true)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(1)
  }

  // --- Export Logic (Updated to use Date Range) ---
  const fetchAllDataForExport = async () => {
    try {
      const res = await incomingVehicleAPI.getHistory({
        page: 1,
        limit: 10000,
        search: searchTerm,
        startDate: dateRange.startDate, // Export respects filters
        endDate: dateRange.endDate
      });
      return res.success ? res.data : [];
    } catch (error) {
      console.error("Export fetch failed", error);
      alert("Failed to fetch data for export");
      return [];
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    const allVehicles = await fetchAllDataForExport();
    setExporting(false);

    if (allVehicles.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Detected Time', 'Decision', 'Zone', 'Pollution Score'];
    const rows = allVehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.detected_time).toLocaleString(),
      v.decision,
      v.zone_name || 'N/A',
      v.pollution_score,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic_logs_${dateRange.startDate || 'all'}_to_${dateRange.endDate || 'now'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    const allVehicles = await fetchAllDataForExport();
    setExporting(false);

    if (allVehicles.length === 0) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Vision Park - Traffic Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    if (dateRange.startDate || dateRange.endDate) {
      doc.text(`Range: ${dateRange.startDate || 'Start'} to ${dateRange.endDate || 'Now'}`, 14, 36);
    }
    doc.text(`Total Records: ${allVehicles.length}`, 14, dateRange.startDate ? 42 : 36);

    const tableData = allVehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      `${v.confidence}%`,
      new Date(v.detected_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      v.decision,
      v.zone_name || '-',
    ]);

    autoTable(doc, {
      head: [['Plate', 'Category', 'Fuel', 'Conf.', 'Detected', 'Decision', 'Zone']],
      body: tableData,
      startY: dateRange.startDate ? 50 : 44,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`traffic_report_${dateRange.startDate || 'all'}_to_${dateRange.endDate || 'now'}.pdf`);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Loader size={56} className="text-blue-600 animate-spin relative z-10" strokeWidth={2.5} />
        </div>
        <p className="text-slate-700 font-medium mt-6 text-lg">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="px-4 md:px-8 lg:px-12 py-8 space-y-8 max-w-[1600px] mx-auto">

        {/* Header Section */}
        <div
  className="sticky top-0 z-20 bg-white/80 backdrop-blur-md
             border border-slate-200 border-t-0
             rounded-b-2xl shadow-md
             px-4 md:px-8 lg:px-12 py-6
             flex flex-col lg:flex-row items-start lg:items-center
             justify-between gap-6">

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  Traffic Logs
                  {isFetching && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      <RefreshCw size={14} className="animate-spin" />
                      Refreshing
                    </span>
                  )}
                </h1>
                <p className="text-slate-600 font-medium">Complete incoming traffic history and analytics</p>
                <div className="w-16 h-[3px] mt-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {exporting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              )}
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-200 text-rose-700 font-semibold rounded-xl hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {exporting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        {/* Charts Section */}
        {trendData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Traffic Chart */}
            <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Daily Traffic Volume</h2>
                  <p className="text-sm text-slate-500">Vehicle count per day</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pollution Trend Chart */}
            <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Activity className="text-rose-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Pollution Trend</h2>
                  <p className="text-sm text-slate-500">Average pollution score</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pollution"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

          {/* Table Header with Search & Filters */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Vehicle Log Details</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {pagination.totalRecords.toLocaleString()} total records found
                </p>
              </div>

              {/* Search & Date Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

                {/* Start Date */}
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full sm:w-40 pl-10 pr-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white text-slate-600"
                    placeholder="Start Date"
                  />
                </div>

                {/* End Date */}
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={16} />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full sm:w-40 pl-10 pr-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white text-slate-600"
                    placeholder="End Date"
                  />
                </div>

                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by number plate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Progress Bar */}
          {isFetching && (
            <div className="h-1 bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-[progress_1s_ease-in-out_infinite]"></div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Plate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Fuel</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Detected Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Decision</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Zone</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-100 transition-opacity duration-300 ${isFetching ? 'opacity-40' : 'opacity-100'}`}>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <Search className="text-slate-400" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">No records found</p>
                        <p className="text-sm text-slate-400">Try adjusting your date range or search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v, idx) => (
                    <tr
                      key={v.id}
                      className="hover:bg-blue-50 transition-colors duration-150 group"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                          {v.number_plate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{v.vehicle_category}</td>
                      <td className="px-6 py-4 text-slate-700">{v.fuel_type}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(v.detected_time).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${v.decision === 'Allow' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            v.decision === 'Warn' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                          {v.decision}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">{v.zone_name || '—'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              Showing <span className="font-bold text-slate-800">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.totalRecords.toLocaleString()}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || isFetching}
                className="p-2.5 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} className="text-slate-700" />
              </button>

              <div className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md">
                Page {pagination.currentPage} / {pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages || isFetching}
                className="p-2.5 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} className="text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}

export default LogsReports