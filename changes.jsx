"use client"

import { useState, useEffect } from "react"
import { Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "lucide-react"
import { vehicleAPI } from "../services/api"

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFuel, setFilterFuel] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showFilters, setShowFilters] = useState(false)

  // === Fetch Vehicles ===
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
  }
}


useEffect(() => {
  fetchVehicles(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentPage, itemsPerPage]);

  // === Exit Handler ===
  const handleExitVehicle = async (id) => {
    try {
      await vehicleAPI.updateExit(id)
      await fetchVehicles(currentPage)
    } catch (error) {
      console.error("Error updating exit:", error)
      alert("Failed to record exit")
    }
  }

  // === Export CSV ===
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

  // === Pagination handlers ===
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
      fetchVehicles(page)
    }
  }

const handleItemsPerPageChange = (newLimit) => {
  setItemsPerPage(newLimit);
  setCurrentPage(1);
};


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

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/95 backdrop-blur-md border-b border-blue-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Vehicle Management
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {vehicles.length > 0
                  ? `Viewing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} vehicles`
                  : "No vehicles found"}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 transition-all duration-200 w-full md:w-auto transform hover:translate-y-[-2px]"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100/40 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div
            className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-200">
                <Filter size={20} className="text-indigo-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Filters</h2>
                <p className="text-xs text-slate-500 font-medium">Search and refine results</p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className={`text-slate-400 transition-transform duration-300 group-hover:text-indigo-600 ${showFilters ? "rotate-90" : ""}`}
            />
          </div>

          {showFilters && (
            <>
              <div className="border-t border-blue-100/40 px-5 md:px-6 py-5 md:py-6 bg-gradient-to-b from-white to-blue-50/30">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      Search Plate
                    </label>
                    <div className="relative group">
                      <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="e.g., ABC-1234"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchVehicles(1)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm hover:border-blue-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      Fuel Type
                    </label>
                    <select
                      value={filterFuel}
                      onChange={(e) => setFilterFuel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-medium hover:border-blue-300"
                    >
                      <option value="all">All Types</option>
                      <option value="EV">Electric</option>
                      <option value="ICE">Combustion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-medium hover:border-blue-300"
                    >
                      <option value="all">All Categories</option>
                      <option value="Private">Private</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      From
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm hover:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-5 md:px-6 py-4 bg-gradient-to-r from-white to-blue-50/30 border-t border-blue-100/40 sm:flex-row">
                <button
                  onClick={() => fetchVehicles(1)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-95 hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-2px]"
                >
                  Apply
                </button>
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2.5 bg-white border border-blue-300 text-slate-700 rounded-lg font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 transform hover:translate-y-[-2px]"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-blue-100/40 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/40">
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
                      className="text-left px-4 md:px-6 py-4 font-semibold text-slate-900 text-xs md:text-sm uppercase tracking-wider text-blue-900"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/40">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading vehicles...</p>
                      </div>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <p className="text-slate-500 text-sm font-medium">No vehicles found</p>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-blue-100/40 last:border-0 cursor-pointer"
                    >
                      <td className="px-4 md:px-6 py-4 font-mono font-bold text-slate-900 text-sm md:text-base">
                        {v.number_plate}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 transform hover:scale-105 ${
                            v.vehicle_category === "Commercial"
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {v.vehicle_category === "Commercial" ? "Commercial" : "Private"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 transform hover:scale-105 ${
                            v.fuel_type === "EV"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                        >
                          {v.fuel_type === "EV" ? "Electric" : "Combustion"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-slate-900 font-semibold text-sm">{v.confidence}%</td>
                      <td className="px-4 md:px-6 py-4 text-slate-600 text-xs md:text-sm">
                        {formatTime(v.entry_time)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                        {v.exit_time ? (
                          <span className="text-slate-600">{formatTime(v.exit_time)}</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs hover:bg-emerald-200 transition-colors duration-200">
                            Inside
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-slate-600 text-xs md:text-sm">{v.zone_name || "N/A"}</td>
                      <td className="px-4 md:px-6 py-4">
                        {!v.exit_time && (
                          <button
                            onClick={() => handleExitVehicle(v.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold rounded-lg hover:from-red-600 hover:to-rose-600 hover:shadow-lg active:scale-95 transition-all duration-200 whitespace-nowrap transform hover:translate-y-[-2px]"
                          >
                            Record Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-white to-blue-50/30 border-t border-blue-100/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs md:text-sm text-slate-600 font-medium">
                Page <span className="font-bold text-indigo-600">{currentPage}</span> of{" "}
                <span className="font-bold text-indigo-600">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                  title="First"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-slate-400 text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-lg font-medium text-xs md:text-sm transition-all transform hover:scale-110 ${
                          currentPage === p
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                            : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                  title="Next"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                  title="Last"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-blue-300"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    className="w-12 md:w-14 px-2 py-1.5 border border-blue-200 rounded-lg text-center text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-blue-300"
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
