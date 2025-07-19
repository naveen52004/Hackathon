// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home"; // 🚫 No trailing space
import Sidebar from "./common/SIdebar"; // fix typo if it's SIdebar.jsx
import Dashboard from "./Components/Dashboard";
import Chat from "./Components/Chat";

const App = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat/>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
