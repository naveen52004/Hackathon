import React, { useEffect, useState } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchConfigData } from "../reducers/Getconfig"; // Updated import
import { fetchDashboardData } from "../reducers/dashboardfetch"; // Updated import
import DynamicAutoCharts from "../charts/DynamicAutoChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentApiPayload, setCurrentApiPayload] = useState(null);
  const [currentChartType, setCurrentChartType] = useState(null);

  // Updated selectors to match new store structure
  const dashboardConfigState = useSelector((state) => state.dashboardConfig);
  const dashboardDataState = useSelector((state) => state.dashboardData);

  useEffect(() => {
    dispatch(fetchConfigData());
  }, [dispatch]);

  // Extract objects from the API response
  const getDataObjects = () => {
    if (!dashboardConfigState.data?.data) return [];

    const responseData = dashboardConfigState.data.data;

    // Extract thread IDs and their configurations
    return Object.keys(responseData)
      .map((threadId, index) => {
        // ← Add index as second parameter
        const configArray = responseData[threadId];
        if (Array.isArray(configArray) && configArray.length > 0) {
          const config = configArray[0]; // Get first configuration
          let parsedPayload = {};

          try {
            parsedPayload = JSON.parse(config.payload);
          } catch (error) {
            console.error("Error parsing payload:", error);
          }

          return {
            key: threadId,
            label: `D${index + 1}`, // Now index is properly defined
            threadId: threadId,
            chartType: config.chartType,
            keyToFieldList: parsedPayload.keyToFieldList,
            apiPayload: { keyToFieldList: parsedPayload.keyToFieldList },
            config: config,
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  };

  const dataObjects = getDataObjects();

  // Handle sidebar item click
  const handleItemClick = async (item, index) => {
    setSelectedItem(index);

    try {
      // Set current chart type and API payload
      setCurrentChartType(item.chartType);
      setCurrentApiPayload(item.apiPayload);

      // Dispatch API call with complete payload structure
      dispatch(fetchDashboardData(item.apiPayload));

      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Set initial data when dashboard data loads
  useEffect(() => {
    if (
      dashboardConfigState.status === "succeeded" &&
      dashboardConfigState.data &&
      selectedItem === null
    ) {
      if (dataObjects.length > 0) {
        const firstItem = dataObjects[0];
        setCurrentChartType(firstItem.chartType);
        setCurrentApiPayload(firstItem.apiPayload);
        setSelectedItem(0);

        // Dispatch initial API call with complete payload
        dispatch(fetchDashboardData(firstItem.apiPayload));
      }
    }
  }, [
    dashboardConfigState.status,
    dashboardConfigState.data,
    dataObjects,
    selectedItem,
    dispatch,
  ]);

  return (
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Dashboard Items
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2">
          {dashboardConfigState.status === "loading" && (
            <p className="text-gray-600 p-3">Loading items...</p>
          )}

          {dashboardConfigState.status === "failed" && (
            <p className="text-red-500 p-3">{dashboardConfigState.error}</p>
          )}

          {dashboardConfigState.status === "succeeded" &&
            dataObjects.length > 0 && (
              <div className="space-y-1">
                {dataObjects.map((item, index) => (
                  <button
                    key={item.key || index}
                    onClick={() => handleItemClick(item, index)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                      selectedItem === index
                        ? "bg-[#db3700] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{item.label}</div>
                    {/* <div className="text-xs opacity-75 mt-1">
                      Chart Type: {item.chartType}
                    </div>
                    {item.keyToFieldList && (
                      <div className="text-xs opacity-75">
                        Fields: {Object.keys(item.keyToFieldList).join(", ")}
                      </div>
                    )} */}
                  </button>
                ))}
              </div>
            )}

          {dashboardConfigState.status === "succeeded" &&
            dataObjects.length === 0 && (
              <p className="text-gray-500 p-3">No items found in the data</p>
            )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header with menu button */}
        <div className="lg:hidden flex items-center p-4 bg-white shadow-sm">
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

        {/* Dashboard Content */}
        <div className="p-4">
          {/* Floating Chat Button */}
          <button
            onClick={() => navigate("/chat")}
            className="fixed bottom-6 right-6 bg-[#db3700] hover:bg-[#c12e00] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
            title="Open Chat"
          >
            <ChatBubbleOutlineIcon className="w-6 h-6" />
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Chat Support
            </span>
          </button>

          {/* Dynamic Charts */}
          <div className="mt-6">
            {dashboardConfigState.status === "loading" && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">
                  Loading dashboard configuration...
                </p>
              </div>
            )}

            {dashboardConfigState.status === "failed" && (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{dashboardConfigState.error}</p>
              </div>
            )}

            {dashboardDataState?.status === "loading" && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            )}

            {dashboardDataState?.status === "failed" && (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{dashboardDataState.error}</p>
              </div>
            )}

            {dashboardConfigState.status === "succeeded" &&
              dashboardDataState?.status === "succeeded" &&
              dashboardDataState.data &&
              currentApiPayload &&
              currentChartType && (
                <div>
                  {selectedItem !== null && dataObjects[selectedItem] && (
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {dataObjects[selectedItem].label}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span className="bg-blue-100 px-2 py-1 rounded">
                          Chart: {dataObjects[selectedItem].chartType}
                        </span>
                        <span className="bg-green-100 px-2 py-1 rounded">
                          Thread:{" "}
                          {dataObjects[selectedItem].threadId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  )}
                  <DynamicAutoCharts
                    apiResponse={dashboardDataState}
                    api_payload={currentApiPayload}
                    chartType={currentChartType}
                  />
                </div>
              )}

            {dashboardConfigState.status === "succeeded" &&
              dataObjects.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">
                    No dashboard configurations found
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
