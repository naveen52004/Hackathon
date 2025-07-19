import React from "react";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import UpdateIcon from "@mui/icons-material/Update";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("actions"); // 'actions' or 'dashboard'

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto flex flex-col justify-between min-h-screen">
      {/* Top Header - unchanged */}
      <div>
        <div className="flex justify-between items-center mb-10 relative">
          <h1 className="text-3xl font-bold text-gray-800 text-center w-full">
            CX Buddy
          </h1>
          <div className="absolute right-0">
            <AccountCircleIcon className="text-gray-600" fontSize="large" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-4 py-2 rounded-l-lg ${
              activeTab === "actions"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-r-lg ${
              activeTab === "dashboard"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
