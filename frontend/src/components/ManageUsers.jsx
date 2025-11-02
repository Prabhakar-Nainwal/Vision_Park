"use client"

import { useState, useEffect } from "react"
import { userAPI } from "../services/api"
import { Plus, Trash2, Users, AlertCircle, CheckCircle } from "lucide-react"

const ManageUsers = () => {
    const [users, setUsers] = useState([])
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        role: "admin",
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("success")
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await userAPI.getAll()
            if (res.success) {
                setUsers(res.users)
            }
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleNewUserChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value })
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        setMessage("")
        try {
            const res = await userAPI.createUser(newUser)
            if (res.success) {
                setMessage("User created successfully!")
                setMessageType("success")
                setNewUser({ username: "", password: "", role: "admin" })
                fetchUsers()
            } else {
                setMessage(res.message || "Error creating user.")
                setMessageType("error")
            }
        } catch (err) {
            setMessage("Error: " + err.message)
            setMessageType("error")
            console.error("Error creating user:", err)
        }
    }

    const handleDeleteUser = async (id) => {
        setConfirmDelete(id);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-8 py-8 border-b border-gray-200/50 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -ml-20 -mt-20 group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-200 rounded-full blur-3xl -mr-20 -mb-20 group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                        <Users size={24} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">User Management</h2>
                </div>
            </div>

            <div className="p-8">
                <form
                    onSubmit={handleCreateUser}
                    className="mb-8 p-6 bg-gradient-to-br from-gradient-to-br from-purple-50/50 via-pink-50/30 to-red-50/20 border-2 border-purple-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-300/70"
                >
                    <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                        Create New User
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative group/input">
                            <input
                                type="text"
                                name="username"
                                value={newUser.username}
                                onChange={handleNewUserChange}
                                placeholder="Username"
                                className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 hover:border-purple-300 hover:shadow-sm"
                                required
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover/input:from-purple-500/5 group-hover/input:to-pink-500/5 pointer-events-none transition-all duration-300"></div>
                        </div>
                        <div className="relative group/input">
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleNewUserChange}
                                placeholder="Password"
                                className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 hover:border-purple-300 hover:shadow-sm"
                                autoComplete="new-password"
                                required
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover/input:from-purple-500/5 group-hover/input:to-pink-500/5 pointer-events-none transition-all duration-300"></div>
                        </div>
                        <div className="relative group/input">
                            <select
                                name="role"
                                value={newUser.role}
                                onChange={handleNewUserChange}
                                className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 hover:border-purple-300 hover:shadow-sm cursor-pointer"
                            >
                                <option value="admin">Admin</option>
                                <option value="organization_admin">Organization Admin</option>
                            </select>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover/input:from-purple-500/5 group-hover/input:to-pink-500/5 pointer-events-none transition-all duration-300"></div>
                        </div>
                        <button
                            type="submit"
                            className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center gap-2 group/btn transform hover:scale-105 active:scale-95 col-span-1 md:col-span-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                            <Plus size={18} className="relative group-hover/btn:rotate-90 transition-transform duration-300" />
                            <span className="relative">Create</span>
                        </button>
                    </div>

                    {message && (
                        <div
                            className={`mt-5 p-4 rounded-xl border-2 flex items-center gap-3 transform transition-all duration-300 hover:scale-105 origin-left ${messageType === "success"
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300/50"
                                : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300/50"
                                }`}
                        >
                            {messageType === "success" ? (
                                <CheckCircle
                                    size={20}
                                    className="text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform"
                                />
                            ) : (
                                <AlertCircle
                                    size={20}
                                    className="text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform"
                                />
                            )}
                            <p className={`text-sm font-semibold ${messageType === "success" ? "text-green-700" : "text-red-700"}`}>
                                {message}
                            </p>
                        </div>
                    )}
                </form>

                {loading ? (
                    <div className="py-16 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-3 shadow-lg"></div>
                        <p className="text-gray-600 font-medium">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        <div className="inline-block p-4 bg-gray-100 rounded-full mb-3 group hover:bg-purple-50 transition-all duration-300 transform hover:scale-110">
                            <Users size={48} className="text-gray-300 group-hover:text-purple-300 transition-colors" />
                        </div>
                        <p className="font-medium">No users yet. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50/50 via-purple-50/30 to-gray-50/50 border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter((u) => u.role !== "organization_admin") // ✅ hide org admins from list
                                    .map((u, idx) => (
                                        <tr
                                            key={u.id}
                                            className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-pink-50/30 hover:to-red-50/20 transition-all duration-200 transform hover:scale-y-105 origin-center group/row"
                                            style={{
                                                animationDelay: `${idx * 50}ms`,
                                            }}
                                        >
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 group-hover/row:text-purple-700 transition-colors">
                                                {u.username}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 capitalize border border-purple-200/50 group-hover/row:shadow-md transition-all duration-300 transform group-hover/row:scale-110">
                                                    {u.role.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 group-hover/row:text-gray-900 transition-colors">
                                                {new Date(u.created_at).toLocaleDateString()}{" "}
                                                <span className="text-gray-400 text-xs block">
                                                    {new Date(u.created_at).toLocaleTimeString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="inline-flex items-center justify-center p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn border border-transparent hover:border-red-200 hover:shadow-sm"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] sm:w-[380px] border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await userAPI.deleteUser(confirmDelete);
                                        setConfirmDelete(null);
                                        fetchUsers();

                                        // Create and style toast
                                        const toast = document.createElement("div");
                                        toast.textContent = "User deleted successfully";
                                        toast.className = "toast-error"; // Red variant for delete
                                        document.body.appendChild(toast);

                                        // Remove toast after 2.5 seconds
                                        setTimeout(() => toast.remove(), 2500);
                                    } catch (error) {
                                        console.error("Error deleting user:", error);
                                    }
                                }}

                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ManageUsers
