// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from './layouts/AdminLayout';
import VerificationPage from "./pages/VerificationPage";
import FeedbackPage from "./pages/FeedbackPage";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";

// Component bảo vệ Route
const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  // Logic đơn giản: Check localStorage. 
  // Nâng cao: Có thể check thêm auth state từ Firebase nhưng sẽ bị delay (loading state)

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<VerificationPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="posts" element={<PostPage />} />
        </Route>

        {/* Catch all - Redirect to Login if not authorized, or Home if authorized */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
