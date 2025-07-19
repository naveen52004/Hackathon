import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to call the API
export const saveConfig = createAsyncThunk(
  "config/saveConfig",
  async ({ payload ,chart_type,thread_id}, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "https://e1f123eca7fe.ngrok-free.app/save-config",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: payload,
            chartType: chart_type,
            threadId: thread_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save config");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const saveConfigSlice = createSlice({
  name: "saveConfig",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveConfig.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveConfig.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(saveConfig.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default saveConfigSlice.reducer;
