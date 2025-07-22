import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to delete dashboard by threadId
export const deleteDashboard = createAsyncThunk(
  "dashboard/deleteDashboard",
  async (threadId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://9c3df7aa9036.ngrok-free.app/delete-config-by-threadId?threadId=${threadId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete dashboard");
      }

      return await response.json(); // Return the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deleteDashboardSlice = createSlice({
  name: "deleteDashboard",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    resetDeleteState: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteDashboard.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(deleteDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetDeleteState } = deleteDashboardSlice.actions;

export default deleteDashboardSlice.reducer;
