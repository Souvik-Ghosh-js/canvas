import React from "react";
import { FolderOpenDot, Save, User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header({ onExport, onOpen, onSave, onExportPDF, onSendEmail }) {
  const navigate = useNavigate();
  
  return (
    <header className="flex justify-between bg-white py-3 px-5 items-center">
      <section className="flex justify-between w-full">
        <section className="flex gap-2">
          <button
            className="bg-[#11224E] rounded-md text-white cursor-pointer px-2 md:p-2"
            onClick={onOpen}
          >
            <FolderOpenDot />
          </button>
          <button
            className="bg-[#FFC50F] p-2 rounded-md text-black px-2 md:p-2 cursor-pointer"
            onClick={onSave}
          >
            <Save />
          </button>
        </section>
        <section className="flex items-center gap-2">
          <button
            className="bg-blue-500 p-2 rounded-md text-white px-2 md:px-3 cursor-pointer flex items-center gap-1"
            onClick={() => navigate("/admin")}
          >
            <User size={16} />
            <span className="hidden md:inline">Admin</span>
          </button>
          <button
            className="bg-green-600 p-2 rounded-md text-white px-2 md:px-3 cursor-pointer flex items-center gap-1"
            onClick={onSendEmail}
          >
            <Mail size={16} />
            <span className="hidden md:inline">Email</span>
          </button>
          <button
            className="bg-blue-500 p-2 rounded-md text-white px-2 md:px-3 cursor-pointer"
            onClick={onExport}
          >
            PNG
          </button>
          <button
            className="bg-blue-500 p-2 rounded-md text-white px-2 md:px-3 cursor-pointer"
            onClick={onExportPDF}
          >
            PDF
          </button>
        </section>
      </section>
    </header>
  );
}

export default Header;