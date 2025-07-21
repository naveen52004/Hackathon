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
  const [selectedThreadId, setSelectedThreadId] = useState(null);

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
    setChatButtonPosition({
      x: Math.max(0, Math.min(newX, window.innerWidth - 80)),
      y: Math.max(0, Math.min(newY, window.innerHeight - 80)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

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
    setChatButtonPosition({
      x: Math.max(0, Math.min(newX, window.innerWidth - 80)),
      y: Math.max(0, Math.min(newY, window.innerHeight - 80)),
    });
    e.preventDefault();
  };

  const handleTouchEnd = () => setIsDragging(false);

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

  // Get unique thread IDs and their dashboard names
  const getThreadButtons = () => {
    const responseData = dashboardConfigState.data?.data;
    if (!responseData || typeof responseData !== "object") return [];

    return Object.entries(responseData).map(([threadId, configArray]) => {
      const dashboardName =
        configArray[0]?.dashboardName || `Thread ${threadId}`;
      return {
        threadId,
        dashboardName,
        configArray,
      };
    });
  };

  const getDataObjects = () => {
    const responseData = dashboardConfigState.data?.data;
    if (!responseData || typeof responseData !== "object" || !selectedThreadId)
      return [];

    const configArray = responseData[selectedThreadId];
    if (!configArray) return [];

    let hasThreadNameBeenUsed = false;
    return configArray
      .filter((config) => config && config.enabled)
      .map((config) => {
        let parsedPayload = {};
        try {
          parsedPayload = JSON.parse(config.payload || "{}");
        } catch (error) {
          console.error(
            "Error parsing payload for config ID:",
            config.id,
            error
          );
        }
        const showThreadName =
          !hasThreadNameBeenUsed && configArray[0]?.dashboardName;
        hasThreadNameBeenUsed = true;
        return {
          key: `${selectedThreadId}_${config.id}`,
          label: showThreadName || "",
          threadId: selectedThreadId,
          chartType: config.chartType || "bar",
          keyToFieldList: parsedPayload || {},
          apiPayload: { keyToFieldList: parsedPayload || {} },
          config,
          id: config.id,
          createdAt: config.createdAt,
        };
      })
      .sort((a, b) => a.id - b.id);
  };

  const threadButtons = getThreadButtons();
  const dataObjects = getDataObjects();

  // Handle thread button click - fetch dashboard data for selected thread
  const handleThreadButtonClick = (threadId, configArray) => {
    setSelectedThreadId(threadId);

    // Fetch dashboard data for all items in the selected thread
    configArray.forEach((item) => {
      if (item && item.enabled) {
        dispatch(
          fetchDashboardData({
            id: item.id,
            payload: JSON.parse(item.payload || "{}"),
          })
        );
      }
    });
  };

  return (
    <div className="fixed h-full w-full flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`group fixed inset-y-0 left-0 z-40 bg-white shadow-md transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 w-40`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-2 space-y-2">
          {dashboardConfigState.status === "loading" && <p>Loading...</p>}
          {dashboardConfigState.status === "failed" && (
            <p className="text-red-500">{dashboardConfigState.error}</p>
          )}
          {dashboardConfigState.status === "succeeded" && (
            <div className="space-y-2">
              {threadButtons.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() =>
                    handleThreadButtonClick(thread.threadId, thread.configArray)
                  }
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedThreadId === thread.threadId
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="truncate">{thread.dashboardName}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
          <button onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>

        {/* Floating Chat Button */}
        <button
          onClick={() => !isDragging && navigate("/chat")}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`fixed bg-[#db3700] hover:bg-[#c12e00] text-white p-4 rounded-full shadow-lg transition-transform duration-200 z-50 group ${
            isDragging
              ? "cursor-grabbing scale-105"
              : "cursor-grab hover:scale-105"
          }`}
          style={{
            left: `${chatButtonPosition.x}px`,
            top: `${chatButtonPosition.y}px`,
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <ChatBubbleOutlineIcon className="w-6 h-6 pointer-events-none" />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {isDragging ? "Release to place" : "Click for Chat"}
          </span>
        </button>

        {/* Charts Content */}
        <div className="flex-1 overflow-auto p-3 space-y-6">
          {!selectedThreadId && (
            <div className="text-gray-500 text-center py-8">
              <p className="text-lg">
                Select a dashboard from the sidebar to view charts
              </p>
            </div>
          )}

          {dataObjects.map((item) => {
            const id = item.id;
            const chartData = dashboardDataState.dataMap?.[id];
            const status = dashboardDataState.statusMap?.[id];

            

            if (status === "failed") {
              return (
                <div key={id} className="text-red-500 text-center py-4">
                  Failed to load data for {item.label}.
                </div>
              );
            }

            if (status === "succeeded" && chartData) {
              return (
                <div key={id}>
                  <DynamicAutoCharts
                    apiResponse={chartData}
                    api_payload={item.keyToFieldList}
                    chartType={item.chartType}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
