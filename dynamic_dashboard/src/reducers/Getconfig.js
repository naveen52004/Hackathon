// reducers/dashboardConfig.js (renamed from dashboardFetch.js)
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchConfigData = createAsyncThunk(
  "dashboardConfig/fetchData", // Changed from "dashboard/fetchData"
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(
        "https://9c3df7aa9036.ngrok-free.app/get-all-config",
        {
          method: "GET",
        }
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const dashboardConfigSlice = createSlice({
  name: "dashboardConfig", // Changed from "dashboard"
  initialState: {
    status: "idle",
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConfigData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchConfigData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default dashboardConfigSlice.reducer;
