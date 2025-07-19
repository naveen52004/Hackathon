import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
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

const dashboardfetch = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetDashboard: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDashboard } = dashboardfetch.actions;
export default dashboardfetch.reducer;
