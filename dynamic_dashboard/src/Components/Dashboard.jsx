import { React, useEffect, useState } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchConfigData } from "../reducers/Getconfig";
import { fetchDashboardData } from "../reducers/dashboardfetch";
import DynamicAutoCharts from "../charts/DynamicAutoChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentApiPayload, setCurrentApiPayload] = useState(null);
  const [currentChartType, setCurrentChartType] = useState(null);

  // Draggable chat button state
  const [chatButtonPosition, setChatButtonPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight - 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dashboardConfigState = useSelector((state) => state.dashboardConfig);
  const dashboardDataState = useSelector((state) => state.dashboardData);

  useEffect(() => {
    dispatch(fetchConfigData());
  }, [dispatch]);

  // Handle window resize to keep button in bounds
  useEffect(() => {
    const handleResize = () => {
      setChatButtonPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 80),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep button within screen bounds
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 80));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 80));

    setChatButtonPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile dragging
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;

    // Keep button within screen bounds
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 80));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 80));

    setChatButtonPosition({ x: boundedX, y: boundedY });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global mouse move and up listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  const getDataObjects = () => {
    if (!dashboardConfigState.data?.data) return [];

    const responseData = dashboardConfigState.data.data;

    return Object.keys(responseData)
      .map((threadId, index) => {
        const configArray = responseData[threadId];
        if (Array.isArray(configArray) && configArray.length > 0) {
          const config = configArray[0];
          let parsedPayload = {};

          try {
            parsedPayload = JSON.parse(config.payload);
          } catch (error) {
            console.error("Error parsing payload:", error);
          }
          const label = config.dashboardName || `D${index + 1}`;
          return {
            key: threadId,
            label: label,
            threadId,
            chartType: config.chartType,
            keyToFieldList: parsedPayload.keyToFieldList,
            apiPayload: { keyToFieldList: parsedPayload.keyToFieldList },
            config,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const dataObjects = getDataObjects();

  const handleItemClick = async (item, index) => {
    setSelectedItem(index);
    setCurrentChartType(item.chartType);
    setCurrentApiPayload(item.apiPayload);
    dispatch(fetchDashboardData(item.apiPayload));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (
      dashboardConfigState.status === "succeeded" &&
      dashboardConfigState.data &&
      selectedItem === null &&
      dataObjects.length > 0
    ) {
      const firstItem = dataObjects[0];
      setCurrentChartType(firstItem.chartType);
      setCurrentApiPayload(firstItem.apiPayload);
      setSelectedItem(0);
      dispatch(fetchDashboardData(firstItem.apiPayload));
    }
  }, [
    dashboardConfigState.status,
    dashboardConfigState.data,
    dataObjects,
    selectedItem,
    dispatch,
  ]);

  return (
    <div className="h-screen w-full flex overflow-hidden ]">
      {/* Sidebar - Fixed position */}
      <div
        className={`group fixed inset-y-0 left-0 z-40 bg-white shadow-lg transition-all duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:inset-0 flex flex-col w-20 hover:w-60`}
      >
        {/* Top Bar with Close Button */}
        <div className="flex items-center justify-end p-4 border-b flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {dashboardConfigState.status === "loading" && (
            <p className="text-gray-600 p-3">Loading items...</p>
          )}
          {dashboardConfigState.status === "failed" && (
            <p className="text-red-500 p-3">{dashboardConfigState.error}</p>
          )}
          {dashboardConfigState.status === "succeeded" &&
            dataObjects.map((item, index) => (
              <button
                key={item.key || index}
                onClick={() => handleItemClick(item, index)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 whitespace-nowrap overflow-hidden
            ${
              selectedItem === index
                ? "bg-[#db3700] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
              >
                {/* Icon or bullet can go here if you have one */}
                <div className="font-medium truncate group-hover:whitespace-normal">
                  {item.label}
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content - Constrained to remaining space */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 bg-white shadow-sm flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="ml-3 text-xl font-semibold text-gray-800">
            Dashboard
          </h1>
        </div>

        {/* Content Area - No horizontal overflow */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Draggable Chat Button */}
          <button
            onClick={() => !isDragging && navigate("/chat")}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`fixed bg-[#db3700] hover:bg-[#c12e00] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group ${
              isDragging
                ? "cursor-grabbing scale-110"
                : "cursor-grab hover:scale-105"
            }`}
            style={{
              left: `${chatButtonPosition.x}px`,
              top: `${chatButtonPosition.y}px`,
              userSelect: "none",
              touchAction: "none",
            }}
            title=" Click to open Chat"
          >
            <ChatBubbleOutlineIcon className="w-6 h-6 pointer-events-none" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isDragging ? "Release to place" : "Click for Chat"}
            </span>
          </button>

          {/* Chart Section - Only this scrolls horizontally */}
          <div className="flex-1 p-4 overflow-hidden">
            {selectedItem !== null && dataObjects[selectedItem] && (
              <div className="mb-10 flex justify-center">
                <h3 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-md tracking-wide font-poster">
                  {dataObjects[selectedItem].label}
                </h3>
              </div>
            )}

            {/* Chart Container - Horizontal scroll only for chart */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-[1000px] h-full">
                {dashboardDataState?.status === "loading" && (
                  <div className="text-gray-500 text-center py-20 h-full flex items-center justify-center">
                    Loading data...
                  </div>
                )}
                {dashboardDataState?.status === "failed" && (
                  <div className="text-red-500 text-center py-20 h-full flex items-center justify-center">
                    {dashboardDataState.error}
                  </div>
                )}
                {dashboardDataState?.status === "succeeded" &&
                  currentApiPayload &&
                  currentChartType && (
                    <div className="h-full">
                      <DynamicAutoCharts
                        apiResponse={dashboardDataState}
                        api_payload={currentApiPayload}
                        chartType={currentChartType}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
