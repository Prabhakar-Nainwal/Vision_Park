"use client"
import { useState } from "react"
import { ArrowLeft, Lock, AlertCircle, Sparkle as Park, Eye, EyeOff } from "lucide-react"
import axios from "axios"

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password })
      if (res.data.token) {
        onLogin(res.data.token)
        window.location.href = "/"
      } else {
        setError("Invalid server response")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    window.location.href = "/"
  }

  return (
    <div className="max-h-screen flex bg-white text-slate-900 overflow-hidden mt-10">
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-slate-50 via-blue-50 to-white flex-col justify-between p-16 relative overflow-hidden border-r border-slate-300/50">
        {/* Background animated elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/6 to-cyan-400/4 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 -left-48 w-80 h-80 bg-gradient-to-tr from-blue-300/5 to-slate-300/3 rounded-full blur-3xl"
          style={{ animation: "pulse 4s ease-in-out infinite", animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-300/4 to-transparent rounded-full blur-2xl"
          style={{ animation: "pulse 5s ease-in-out infinite", animationDelay: "2.5s" }}
        />

        {/* Header Section */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-40" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/30">
                <Park size={32} className="text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vision Park</h1>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Admin Control Center</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-16 max-w-sm">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight text-slate-900 tracking-tight">
                Intelligent Parking Management
              </h2>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                Advanced analytics, real-time monitoring, and comprehensive control over your parking infrastructure.
              </p>
            </div>
          </div>
        </div>

        <div class="relative inline-flex items-center justify-center gap-4 group">
          <div
            class="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
          ></div>
          <a
            role="button"
            class="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
            title="payment"
            href="/"
          >Continue as a Viewer<svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            height="10"
            width="10"
            fill="none"
            class="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
          >
              <path
                d="M0 5h7"
                class="transition opacity-0 group-hover:opacity-100"
              ></path>
              <path
                d="M1 1l4 4-4 4"
                class="transition group-hover:translate-x-[3px]"
              ></path>
            </svg>
          </a>
        </div>



      </div>

      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
        {/* Enhanced background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-56 w-96 h-96 bg-gradient-to-br from-blue-200/8 to-blue-100/4 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/3 -right-56 w-96 h-96 bg-gradient-to-tl from-cyan-200/6 to-cyan-100/3 rounded-full blur-3xl"
            style={{ animation: "pulse 4s ease-in-out infinite", animationDelay: "2s" }}
          />
          <div className="absolute top-0 right-1/3 w-72 h-72 bg-gradient-to-b from-blue-100/5 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <button
            onClick={handleGoBack}
            className="absolute -top-12 left-0 flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-semibold uppercase tracking-wide">Back</span>
          </button>

          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 rounded-t-2xl shadow-lg" />

            {/* Header section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl border border-blue-200/50 shadow-md">
                  <Lock size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
                  <p className="text-slate-500 text-xs font-medium">Vision Park</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm font-medium">Secure authentication required</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-700 mb-2.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-slate-400 text-slate-900 group-hover:border-slate-400 shadow-sm"
                />
              </div>

              {/* Password input */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-700 mb-2.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-slate-400 text-slate-900 group-hover:border-slate-400 pr-10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group relative overflow-hidden border border-blue-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {loading ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    <Lock size={18} />
                    <span>Access Dashboard</span>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200/50">
              <p className="text-xs text-slate-500 text-center font-medium">
                🔒 Protected with industry-standard encryption
              </p>
            </div>
          </div>

          {/* Mobile-only branding */}
          <div className="lg:hidden mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Park size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">Vision Park</span>
            </div>
            <p className="text-slate-600 text-sm">Admin Control Center</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
