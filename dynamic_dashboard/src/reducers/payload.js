import { createSlice } from "@reduxjs/toolkit";

const payload = createSlice({
  name: "configData",
  initialState: {
    data: null,
  },
  reducers: {
    setConfigData: (state, action) => {
      state.data = action.payload;
    },
    clearConfigData: (state) => {
      state.data = null;
    },
  },
});

export const { setConfigData, clearConfigData } = payload.actions;
export default payload.reducer;
