"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../services/api"
import { Eye, EyeOff, Save, User } from "lucide-react"

const MyProfile = ({ currentUser, onProfileUpdated }) => {
const [formData, setFormData] = useState({ username: "", password: "" })
const [showPassword, setShowPassword] = useState(false)
const [message, setMessage] = useState("")
const [loading, setLoading] = useState(false)

useEffect(() => {
if (currentUser) {
setFormData({ username: currentUser.username || "", password: "" })
}
}, [currentUser])

const handleProfileChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value })
}

const handleProfileSubmit = async (e) => {
e.preventDefault()
if (!currentUser) {
setMessage("User not found. Please re-login.")
return
}

 
const updateData = {}
if (formData.username.trim() && formData.username !== currentUser.username) {
  updateData.username = formData.username.trim()
}
if (formData.password.trim()) {
  updateData.password = formData.password.trim()
}

if (Object.keys(updateData).length === 0) {
  setMessage("No changes to save.")
  return
}

setLoading(true)
setMessage("")
try {
  // ✅ safer: do not pass id manually if backend uses JWT
  const res = await userAPI.updateProfile(updateData)

  if (res.success) {
    setMessage("Profile updated successfully!")
    setFormData({ ...formData, password: "" })

    if (onProfileUpdated) onProfileUpdated(updateData)
  } else {
    setMessage(res.message || "Error updating profile.")
  }
} catch (err) {
  console.error("Profile update failed:", err)
  setMessage("Error updating profile.")
} finally {
  setLoading(false)
}
 

}

return ( <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden hover:shadow-2xl transition-all duration-300 group"> <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-8 py-8 border-b border-gray-200/50 overflow-hidden"> <div className="absolute inset-0 opacity-20"> <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -mr-20 -mt-20"></div> <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl -ml-20 -mb-20"></div> </div> <div className="relative flex items-center gap-4"> <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30"> <User size={24} className="text-white" /> </div> <h2 className="text-3xl font-bold text-white tracking-tight">My Profile</h2> </div> </div>

 
  <form onSubmit={handleProfileSubmit} className="p-8">
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-900 mb-3">Username</label>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleProfileChange}
        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        placeholder="Enter your username"
      />
    </div>

    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-900 mb-3">New Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleProfileChange}
          placeholder="Enter new password"
          autoComplete="new-password"
          className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

    {message && (
      <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg text-green-700 font-medium">
        {message}
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-60"
    >
      {loading ? "Saving..." : "Save Changes"}
    </button>
  </form>
</div>
 

)
}

export default MyProfile
