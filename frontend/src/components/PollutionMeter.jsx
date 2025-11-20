"use client"

import { useState, useEffect } from "react"

const PollutionMeter = ({ pollutionIndex = 0 }) => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [pollutionIndex])

  const getAqiStatus = (index) => {
    if (index <= 25)
      return {
        status: "Excellent",
        color: "#059669",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
      }
    if (index <= 50)
      return {
        status: "Good",
        color: "#06b6d4",
        bgColor: "bg-cyan-50",
        textColor: "text-cyan-700",
        borderColor: "border-cyan-200",
      }
    if (index <= 75)
      return {
        status: "Moderate",
        color: "#f59e0b",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      }
    if (index <= 90)
      return {
        status: "Poor",
        color: "#f97316",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      }
    return {
      status: "Critical",
      color: "#dc2626",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    }
  }

  const aqiInfo = getAqiStatus(pollutionIndex)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Gauge Section */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200 mb-6 overflow-hidden relative">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight inline-block relative">
            Pollution Index
            <span className="block w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></span>
          </h2>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-slate-100 to-transparent rounded-full opacity-30 -z-10"></div>

        <div className="flex flex-col items-center mb-1 relative z-10 ">
          {/* Gauge visualization (raised upwards version) */}
          <div className="flex flex-col items-center relative z-10 -mt-12 mb-2">
            <div className="relative w-56 h-40">
              <svg
                className="w-full h-full"
                viewBox="0 0 200 120"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="33%" stopColor="#06b6d4" />
                    <stop offset="66%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                {/* Arc positioned slightly higher (center at 100,100) */}
                <path
                  d="M 30 100 A 70 70 0 0 1 170 100"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Needle rotation */}
                {(() => {
                  const idx = Number.isFinite(+pollutionIndex) ? Number(+pollutionIndex) : 0
                  const clamped = Math.max(0, Math.min(100, idx))
                  const angle = (clamped / 100) * 180 - 90
                  return (
                    <g transform={`rotate(${angle} 100 100)`} style={{ transition: "transform 0.8s ease-out" }}>
                      <line x1="100" y1="100" x2="100" y2="35" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="100" cy="100" r="6" fill="#374151" />
                    </g>
                  )
                })()}

                {/* Center cap */}
                <circle cx="100" cy="100" r="8" fill="white" stroke="#e5e7eb" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* AQI Label */}
          <div className="text-center mb-6 w-full">
            <div
              className={`inline-block ${aqiInfo.bgColor} ${aqiInfo.textColor} px-8 py-3 rounded-full mb-4 font-bold text-sm tracking-wide border-2 ${aqiInfo.borderColor} shadow-md transition-all duration-300 hover:shadow-lg`}
            >
              {aqiInfo.status.toUpperCase()}
            </div>
            <div className="text-7xl font-black text-slate-900 mb-2 tracking-tight">{pollutionIndex}</div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
              Air Quality Index
            </p>
          </div>

          {/* AQI Description */}
          <div
            className={`w-full ${aqiInfo.bgColor} border-l-4 ${aqiInfo.borderColor} rounded-2xl p-5 text-center`}
          >
            <p className={`text-sm font-semibold ${aqiInfo.textColor}`}>
              {pollutionIndex <= 25 && "Air quality is excellent. Perfect for outdoor activities."}
              {pollutionIndex > 25 &&
                pollutionIndex <= 50 &&
                "Air quality is good. Suitable for most outdoor activities."}
              {pollutionIndex > 50 &&
                pollutionIndex <= 75 &&
                "Air quality is moderate. Consider limiting prolonged outdoor activities."}
              {pollutionIndex > 75 &&
                pollutionIndex <= 90 &&
                "Air quality is poor. Sensitive groups should avoid outdoor activities."}
              {pollutionIndex > 90 &&
                "Air quality is critical. Everyone should minimize outdoor exposure."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PollutionMeter