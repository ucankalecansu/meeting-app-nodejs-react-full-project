import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login, Register, Meeting } from "./pages";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Ana sayfayı login'e yönlendir */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/meetings" element={<Meeting />} />
    </Routes>
  </BrowserRouter>
);

export default App;
