// reducers/dashboardData.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboardData/fetchData", // Changed from "dashboard/fetchData"
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      const enhancedPayload = {
        keyToFieldList: payload,
        filter: {
          startDate: startOfDay.getTime(),
          endDate: endOfDay.getTime(),
          notFetchEmpData: false,
        },
      };

      const response = await fetch(
        "https://democrm.kapturecrm.com/ms/dashboard/performance-dashboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic ZGVtb2NybTpEZW1vY3JtJDMyMQ==",
          },
          body: JSON.stringify(enhancedPayload),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        id,
        data,
        payload,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardDataSlice = createSlice({
  name: "dashboardData",
  initialState: {
    dataMap: {},
    statusMap: {},
    errorMap: {},
  },
  reducers: {
    resetDashboard: (state) => {
      state.dataMap = {};
      state.statusMap = {};
      state.errorMap = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state, action) => {
        const id = action.meta.arg.id;
        state.statusMap[id] = "loading";
        state.errorMap[id] = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        console.log("Data fetched for ID:", id, data); // <-- Add this
        state.statusMap[id] = "succeeded";
        state.dataMap[id] = data;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.statusMap[id] = "failed";
        state.errorMap[id] = action.payload || "Unknown error";
      });
  },
});

export const { resetDashboard } = dashboardDataSlice.actions;
export default dashboardDataSlice.reducer;
