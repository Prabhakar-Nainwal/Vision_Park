"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import StatsDisplayBox from '../components/StatsDisplayBox';
const TrafficAnalytics = () => {
  const [data, setData] = useState([])
  const [type, setType] = useState("month")
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchAnalytics = useCallback(
    async (customType = type) => {
      try {
        setLoading(true)
        let url = `http://localhost:5000/api/vehicles/analytics/traffic?type=${customType}`
        if (customType === "day" && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`
        }
        const res = await fetch(url)
        const json = await res.json()
        if (json.success) {
          const formatted = json.data.map(item => ({
            ...item,
            allowed: Number(item.allowed),
            warned: Number(item.warned),
            ignored: Number(item.ignored),
          }))
          setData(formatted)
        } else {
          setData([])
        }

      } catch (err) {
        console.error("Error fetching analytics:", err)
      } finally {
        setLoading(false)
      }
    },
    [type, startDate, endDate],
  )

  // Auto fetch when type changes (except "day" which waits for user range)
  useEffect(() => {
    if (type === "month" || type === "year") {
      fetchAnalytics(type)
    } else if (type === "day" && startDate && endDate) {
      fetchAnalytics("day")
    } else if (type === "day") {
      setData([])
    }
  }, [type, startDate, endDate, fetchAnalytics])

  const formatDateLabel = (label) => {
    const d = new Date(label)
    if (isNaN(d)) return label
    if (type === "year") return label
    if (type === "month") return d.toLocaleDateString("en-US", { year: "numeric", month: "short" })
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  // Compute busiest period based on total traffic
  const busiest = data.length
    ? data.reduce((max, curr) => (curr.total > max.total ? curr : max))
    : null;



  return (
    <div className="px-4 md:px-8 lg:px-10  space-y-6">
      <div className=" rounded-lg p-4 mb-4 flex justify-between items-center">
        {/* Heading */}
        <div className="px-2 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Traffic Analytics
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Monitor vehicle traffic patterns and trends
          </p>
          <div className="w-16 h-[3px] mt-2 bg-gradient-to-r from-blue-400 to-sky-400 rounded-full"></div>
        </div>


        {/* View By + Date Filter */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 shadow-sm">


          {/* Date Filter  */}
          {type === "day" && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-max">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-max">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <button
                  onClick={() => fetchAnalytics("day")}
                  disabled={!startDate || !endDate || loading}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${!startDate || !endDate || loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading
                    </span>
                  ) : (
                    "Fetch"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* View By Buttons */}
          <div>
            <div className="flex gap-1.5">
              {["day", "month", "year"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${type === t
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Traffic Overview</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {type === "day" && startDate && endDate && `${startDate} to ${endDate}`}
            {type === "month" && "Monthly breakdown"}
            {type === "year" && "Yearly breakdown"}
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-slate-600 text-sm">Loading chart data...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-600 text-sm">No data available</p>
                <p className="text-slate-500 text-xs mt-1">Try selecting different date ranges or view options</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                barGap={2}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tickFormatter={formatDateLabel}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  minTickGap={30}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                  labelStyle={{ color: "#334155", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ paddingTop: "50px", fontSize: "12px" }} iconType="square" />
                <Bar dataKey="allowed" fill="#10b981" name="Allowed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="warned" fill="#f59e0b" name="Warned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ignored" fill="#a78bfa" name="Ignored" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <StatsDisplayBox type={type} busiest={busiest} loading={loading} data={data} />
        </div>
      </div>
    </div>

  )
}

export default TrafficAnalytics
