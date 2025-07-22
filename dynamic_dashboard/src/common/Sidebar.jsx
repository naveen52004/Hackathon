import React from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen = true, setIsOpen = () => {} }) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-[rgb(0,23,43)] text-white shadow-lg transform transition-transform duration-300 ease-in-out 
    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
    sm:translate-x-0 sm:relative sm:w-16 sm:h-screen flex flex-col px-4 py-6`}
      >
        {/* Back Button - Mobile Only */}
        <div className="flex justify-start sm:hidden mb-4 flex-shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-1 text-white hover:text-[#db3700] transition"
          >
            <ArrowBackIcon fontSize="small" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* Top Section */}
        <div className="space-y-4 flex-shrink-0">
          <SidebarButton
            onClick={() => navigate("/dashboard")}
            icon={
              <img src="/dashboard.png" alt="Dashboard" className="w-10 h-5 " />
            }
          />

          <SidebarButton icon={<HelpOutlineIcon />} />
          <SidebarButton icon={<HistoryIcon />} />
        </div>

        {/* Spacer - This will grow to push bottom section down */}
        <div className="flex-grow" />

        {/* Bottom Section */}
        <div className="space-y-2 flex-shrink-0">
          <SidebarButton icon={<SettingsIcon />} />
          <div className="relative group flex justify-center items-center">
            <button onClick={() => navigate("/")}>
              <img
                src="/kapImg.svg"
                alt="Kapture logo"
                className="w-8 h-8 object-contain"
              />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Kapture-CX
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop - Mobile Only */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
        />
      )}
    </>
  );
};

const SidebarButton = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center rounded-lg hover:bg-[#db3700] cursor-pointer p-2 w-full"
  >
    {icon}
  </button>
);

export default Sidebar;
