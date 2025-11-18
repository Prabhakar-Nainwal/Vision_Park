"use client"

import { useState, useEffect } from "react"
import { Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Car, Zap, Fuel, Calendar, XCircle } from "lucide-react"
import { vehicleAPI } from "../services/api"

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFuel, setFilterFuel] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showFilters, setShowFilters] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isFirstSearch, setIsFirstSearch] = useState(true)

  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true)
      const filters = { page, limit: itemsPerPage }

      if (filterFuel !== "all") filters.fuelType = filterFuel
      if (filterCategory !== "all") filters.vehicleCategory = filterCategory
      if (searchTerm) filters.search = searchTerm
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate

      const response = await vehicleAPI.getAll(filters)
      if (response.success) {
        setVehicles(response.data)
        if (response.pagination) {
          setTotalItems(response.pagination.total)
          setTotalPages(response.pagination.pages)
          setCurrentPage(response.pagination.page)
        } else {
          setTotalItems(response.count || response.data.length)
          setTotalPages(Math.ceil((response.count || response.data.length) / itemsPerPage))
        }
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoading(false)
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles(currentPage)
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    if (isFirstSearch) {
      setIsFirstSearch(false)
      return
    }

    const searchTimer = setTimeout(() => {
      fetchVehicles(1)
    }, 400)

    return () => {
      clearTimeout(searchTimer)
    }
  }, [searchTerm])

  const handleExitVehicle = async (id) => {
    try {
      await vehicleAPI.updateExit(id)
      await fetchVehicles(currentPage)
    } catch (error) {
      console.error("Error updating exit:", error)
      alert("Failed to record exit")
    }
  }

  const exportToCSV = () => {
    const headers = ["Number Plate", "Category", "Fuel Type", "Confidence", "Entry Time", "Exit Time", "Zone"]
    const rows = vehicles.map((v) => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.entry_time).toLocaleString(),
      v.exit_time ? new Date(v.exit_time).toLocaleString() : "Still Inside",
      v.zone_name || "N/A",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vehicle_logs_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      fetchVehicles(page)
    }
  }

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "-"
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push("...", totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...")
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
    }
    return pages
  }

  const clearAllFilters = () => {
    setStartDate("")
    setEndDate("")
    setFilterFuel("all")
    setFilterCategory("all")
    setSearchTerm("")
    fetchVehicles(1)
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-lg text-slate-700 font-semibold">Loading vehicles...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-1 mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  Vehicle Management
                </h1>
                <p className="text-sm text-gray-600 mt-1.5 font-medium">
                  {vehicles.length > 0
                    ? `Viewing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                      currentPage * itemsPerPage,
                      totalItems
                    )} of ${totalItems} vehicles`
                    : "No vehicles found"}
                </p>
                <div className="w-16 h-[3px] mt-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"></div>
              </div>

            </div>

            <button
              onClick={exportToCSV}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Filter size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-slate-900">Filters & Search</h2>
                <p className="text-xs text-slate-500">Refine your vehicle list</p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className={`text-slate-400 transition-transform ${showFilters ? "rotate-90" : ""}`}
            />
          </button>

          {showFilters && (
            <>
              <div className="border-t border-slate-200 p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Search Number Plate
                    </label>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Enter plate number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Fuel Type
                    </label>
                    <div className="relative">
                      <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select
                        value={filterFuel}
                        onChange={(e) => setFilterFuel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        <option value="EV">Electric</option>
                        <option value="ICE">Combustion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        <option value="Private">Private</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => fetchVehicles(1)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Clear All
                </button>
              </div>
            </>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Number Plate",
                    "Category",
                    "Fuel Type",
                    "Confidence",
                    "Entry Time",
                    "Exit Time",
                    "Zone",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 font-semibold text-slate-700 text-sm"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                        <p className="text-slate-600 font-medium">Loading vehicles...</p>
                      </div>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Car size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No vehicles found</p>
                        <p className="text-sm text-slate-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v, idx) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900">
                          {v.number_plate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${v.vehicle_category === "Commercial"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {v.vehicle_category === "Commercial" ? "Commercial" : "Private"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${v.fuel_type === "EV"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                            }`}
                        >
                          {v.fuel_type === "EV" ? (
                            <>
                              <Zap size={12} />
                              Electric
                            </>
                          ) : (
                            <>
                              <Fuel size={12} />
                              Combustion
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ width: `${v.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{v.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatTime(v.entry_time)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {v.exit_time ? (
                          <span className="text-slate-600">{formatTime(v.exit_time)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Inside
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                          {v.zone_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!v.exit_time && (
                          <button
                            onClick={() => handleExitVehicle(v.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm hover:shadow"
                          >
                            <XCircle size={14} />
                            Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-900">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                  title="First"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-slate-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${currentPage === p
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "text-slate-600 hover:bg-white"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                  title="Next"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-600 hover:bg-white disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                  title="Last"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 border border-slate-300 rounded-lg text-center text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VehicleManagement