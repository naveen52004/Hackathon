import { configureStore } from "@reduxjs/toolkit";
import payload from "../reducers/payload";
import Saveconfig from "../reducers/Saveconfig";
import dashboardConfigReducer from "../reducers/Getconfig"; // Updated import
import dashboardDataReducer from "../reducers/dashboardfetch";
export const store = configureStore({
  reducer: {
    payload: payload,
    saveConfig: Saveconfig,
    dashboardConfig: dashboardConfigReducer, // Updated key
    dashboardData: dashboardDataReducer,
  },
});
