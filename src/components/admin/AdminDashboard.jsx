import React, { useState } from "react";

import { LogOut } from "lucide-react";
import LogoUpload from "./LogoUpload";
import BackgroundUpload from "./Background";
const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("logo");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md">
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-xl font-bold text-gray-700">Admin Panel</h2>
          <button
            className="bg-red-600 p-2 rounded-md text-white cursor-pointer"
            onClick={onLogout}
          >
            <LogOut />
          </button>
        </div>
        <nav className="flex md:flex-col">
          {["logo", "background", "template"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-center capitalize ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === "logo" && <LogoUpload />}
        {activeTab === "background" && <BackgroundUpload />}
      </div>
    </div>
  );
};

export default AdminDashboard;
