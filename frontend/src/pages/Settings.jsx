// src/pages/Settings.jsx

import React, { useEffect, useState } from "react";
import { userAPI } from "../services/api"; // Make sure this path is correct
import { User, Users, Loader2 } from "lucide-react"; // Import icons

// Import the child components
import MyProfile from "../components/MyProfile";
import ManageUsers from "../components/ManageUsers";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New state to manage which tab is active
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'users'

  // Fetch the current user's profile on mount to get their role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        if (res.success) {
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <div className="p-6 text-red-600">Could not load user profile.</div>;
  }

  // Helper variable for role check
  const isOrgAdmin = currentUser.role === "organization_admin";

  // Helper function to get tab button styles
  const getTabClassName = (tabName, isDisabled = false) => {
    if (isDisabled) {
      return "flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-gray-400 cursor-not-allowed";
    }
    
    const isActive = activeTab === tabName;
    return `flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
      isActive
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    } cursor-pointer`;
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* --- Tab Navigation Bar --- */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          
          {/* My Profile Tab (Always enabled) */}
          <button
            onClick={() => setActiveTab("profile")}
            className={getTabClassName("profile")}
          >
            <User size={16} className="mr-2" />
            My Profile
          </button>

          {/* User Management Tab (Enabled/Disabled by role) */}
          <button
            onClick={() => isOrgAdmin && setActiveTab("users")} // Only allow click if org admin
            disabled={!isOrgAdmin} // Disable the button for non-org-admins
            className={getTabClassName("users", !isOrgAdmin)}
            title={
              isOrgAdmin
                ? "Manage all users"
                : "You do not have permission to manage users"
            }
          >
            <Users size={16} className="mr-2" />
            User Management
          </button>
        </nav>
      </div>

      {/* --- Tab Content Area --- */}
      {/* This logic now conditionally renders the correct component
        based on the activeTab state.
      */}
      <div>
        {activeTab === "profile" && (
          <MyProfile currentUser={currentUser} />
        )}

        {/* This will only show if the tab is 'users'.
          An 'admin' cannot set the tab to 'users',
          so this component will never render for them.
        */}
        {activeTab === "users" && (
          <ManageUsers />
        )}
      </div>
    </div>
  );
};

export default Settings;