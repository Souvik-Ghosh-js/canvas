import React from "react";
import { FolderOpenDot, Save, User, Mail, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header({ onExport, onOpen, onSave, onExportJSON, onExportCurrentJSON, onSendEmail }) {
  const navigate = useNavigate();
  
  return (
    <header className="flex items-center bg-white border-b border-gray-200 py-2 px-3 sm:px-4 shadow-sm">
      <section className="flex justify-between w-full items-center">
        {/* Left Section - File Operations */}
        <section className="flex gap-1 sm:gap-1.5">
          <button
            className="bg-[#11224E] hover:bg-[#0a1a3a] rounded-md text-white p-1.5 sm:p-2 cursor-pointer transition-colors duration-200 flex items-center justify-center"
            onClick={onOpen}
            title="Open Project"
          >
            <FolderOpenDot size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            className="bg-[#FFC50F] hover:bg-[#e6b10e] p-1.5 sm:p-2 rounded-md text-black cursor-pointer transition-colors duration-200 flex items-center justify-center"
            onClick={onSave}
            title="Save Project"
          >
            <Save size={18} className="sm:w-5 sm:h-5" />
          </button>
        </section>

        {/* Right Section - Actions */}
        <section className="flex items-center gap-1 sm:gap-1.5">
          {/* Admin Dropdown */}
          <div className="relative group">
            <button
              className="bg-blue-500 hover:bg-blue-600 p-1.5 sm:p-2 rounded-md text-white cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5"
              title="Admin Options"
            >
              <User size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  // Perform all admin-related actions that the original admin button did
                  console.log("Admin login/access requested");
                  // You can add multiple actions here or navigate to admin panel
                  navigate("/admin"); // or wherever your admin panel is
                }}
              >
                <User size={16} />
                Login
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={onExportJSON}
              >
                <Download size={16} />
                Project JSON
              </button>
            </div>
          </div>

          {/* Email Button */}
          <button
            className="bg-green-600 hover:bg-green-700 p-1.5 sm:p-2 rounded-md text-white cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5"
            onClick={onSendEmail}
            title="Send Email"
          >
            <Mail size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Email</span>
          </button>

          {/* Export PNG */}
          <button
            className="bg-blue-500 hover:bg-blue-600 p-1.5 sm:p-2 rounded-md text-white cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5"
            onClick={onExport}
            title="Export as PNG"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </section>
      </section>
    </header>
  );
}

export default Header;