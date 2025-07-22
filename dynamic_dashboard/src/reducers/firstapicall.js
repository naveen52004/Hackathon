import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to call the API using threadId as a query parameter
export const firstapicall = createAsyncThunk(
  "config/getAllConfigById",
  async ({ thread_id }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://9c3df7aa9036.ngrok-free.app/get-all-config-by-id?threadId=${thread_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch config by threadId");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const firstapicallSlice = createSlice({
  name: "getAllConfigById",
  initialState: {
    status: "idle",
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(firstapicall.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(firstapicall.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(firstapicall.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default firstapicallSlice.reducer;
