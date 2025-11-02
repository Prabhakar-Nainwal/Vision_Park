"use client"
import { Home, Car, MapPin, FileText, BarChart3, LogOut, LogIn, Menu, X, ChevronRight, Settings } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { userAPI } from "../services/api"

const Navbar = ({ token, onLogout }) => {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const profileMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/", public: true },
    { id: "traffic", label: "Traffic Analytics", icon: BarChart3, path: "/traffic", public: true },
    { id: "vehicles", label: "Vehicle Logs", icon: Car, path: "/vehicles", public: false },
    { id: "zones", label: "Parking Zones", icon: MapPin, path: "/zones", public: false },
    { id: "logs", label: "Logs & Reports", icon: FileText, path: "/logs", public: false },
  ]

  // Close sidebar when clicking outside (fixed flicker + edge issue)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If sidebar ref doesn’t exist, do nothing
      if (!sidebarRef.current) return

      // Ignore clicks on the toggle button
      if (event.target.closest("[data-toggle-sidebar]")) return

      // If clicked outside the sidebar -> close it
      if (!sidebarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isProfileMenuOpen])

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return
      try {
        const res = await userAPI.getProfile()
        if (res.success) setCurrentUser(res.user)
      } catch (err) {
        console.error("Error fetching user profile:", err)
      }
    }
    fetchUser()
  }, [token])

  const handleLogout = () => {
    onLogout?.()
    navigate("/login")
    setIsProfileMenuOpen(false)
  }

  const handleLogin = () => {
    navigate("/login")
  }

  const handleSettings = () => {
    navigate("/settings")
    setIsProfileMenuOpen(false)
    setIsOpen(false)
  }

  const handleUserClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  return (
    <>
      {/* Sidebar Toggle Button */}
      {/* Sidebar Toggle Button */}
      <button
        data-toggle-sidebar
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[9999] flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg shadow-md hover:bg-slate-100 transition-all duration-200 active:scale-95"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={22} className="text-slate-700" /> : <Menu size={22} className="text-slate-700" />}
      </button>


      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-r border-slate-200/60 flex flex-col shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-72`}
      >
        {/* Logo */}
        <div className="relative px-8 py-6 border-b border-slate-200/40 bg-gradient-to-br from-white via-slate-50 to-white shadow-sm">
          <div className="relative z-10 flex justify-between items-center mt-8 group">
            <h1 className="text-4xl font-extrabold text-left tracking-tight select-none">
              <span className="text-slate-900 drop-shadow-sm">Vision</span>
              <span
                className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm 
                   transition-all duration-700 ease-out bg-[length:250%_100%] 
                   group-hover:bg-[position:100%_0] group-hover:from-cyan-400 group-hover:via-blue-500 group-hover:to-sky-600"
              >
                Park
              </span>
            </h1>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent opacity-80" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {mainNavItems
            .filter((item) => item.public || token)
            .map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              const isHovered = hoveredItem === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full group relative px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm overflow-hidden ${isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20 scale-105"
                      : "text-slate-700 hover:text-slate-900"
                    }`}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-white/20 shadow-lg"
                          : "bg-slate-100 group-hover:bg-slate-200 group-hover:shadow-md"
                        }`}
                    >
                      <Icon
                        size={20}
                        className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                          } ${isHovered && !isActive ? "scale-110" : ""}`}
                      />
                    </div>
                    <span className={`${isActive ? "font-semibold" : ""}`}>{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full shadow-lg bg-white" />
                  )}
                </button>
              )
            })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-200/40 bg-gradient-to-t from-slate-50 to-transparent relative">
          {token ? (
            <>
              {currentUser && (
                <div ref={profileMenuRef} className="relative">
                  <button
                    onClick={handleUserClick}
                    onMouseEnter={() => setHoveredItem("user")}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="w-full group relative px-3 py-2.5 rounded-lg transition-all duration-300 overflow-hidden hover:bg-slate-50 active:scale-95"
                  >
                    <div className="relative z-10 flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0 ring-1 ring-white/20">
                          {currentUser.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.username}</p>
                          <p className="text-xs text-slate-500 truncate">Admin Access</p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`flex-shrink-0 text-slate-300 transition-all duration-300 ${isProfileMenuOpen ? "rotate-90" : hoveredItem === "user" ? "translate-x-0.5" : ""
                          }`}
                      />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                      <button
                        onClick={handleSettings}
                        className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors duration-150 border-b border-slate-100 text-sm font-medium group"
                      >
                        <Settings size={14} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-red-50 transition-colors duration-150 text-sm font-medium group"
                      >
                        <LogOut size={14} className="text-slate-500 group-hover:text-red-600 transition-colors" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="w-full group relative px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 transition-all duration-300 overflow-hidden mb-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative z-10 flex items-center gap-3 justify-center">
                  <LogIn
                    size={18}
                    className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 text-green-600"
                  />
                  <span>Admin Login</span>
                </div>
              </button>

              <div className="text-center text-xs text-slate-500 mt-3">Viewing public version of VisionPark</div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
