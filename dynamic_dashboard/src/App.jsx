import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Sidebar from "./common/Sidebar";
import Dashboard from "./Components/Dashboard";
import Chat from "./Components/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="flex-grow w-full">
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Route Handling */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
