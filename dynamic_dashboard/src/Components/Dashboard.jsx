import React from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* Your dashboard content goes here */}

      {/* Floating Chat Button */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 bg-[#db3700] hover:bg-[#c12e00] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        title="Open Chat"
      >
        <ChatBubbleOutlineIcon className="w-6 h-6" />

        {/* Optional tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat Support
        </span>
      </button>
    </div>
  );
};

export default Dashboard;
