import { configureStore } from "@reduxjs/toolkit";
import dashboardpayload from "../reducers/dashboardfetch";
import payload from "../reducers/payload"
export const store = configureStore({
  reducer: {
    payload:payload,
    Apiresponse: dashboardpayload,
  },
});
