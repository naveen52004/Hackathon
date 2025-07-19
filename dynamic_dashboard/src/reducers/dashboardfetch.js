// reducers/dashboardData.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboardData/fetchData", // Changed from "dashboard/fetchData"
  async (payload, { rejectWithValue }) => {
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
        ...payload,
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
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardDataSlice = createSlice({
  name: "dashboardData", // Changed from "dashboard"
  initialState: {
    data: null,
    status: "idle", // Changed from loading to status for consistency
    error: null,
  },
  reducers: {
    resetDashboard: (state) => {
      state.data = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetDashboard } = dashboardDataSlice.actions;
export default dashboardDataSlice.reducer;
