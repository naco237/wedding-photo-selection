import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PhotoGrid } from './components/PhotoGrid';
import { useAuthStore } from './store/authStore';

const ProtectedClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClientAuthenticated = useAuthStore((state) => state.isClientAuthenticated);
  return isClientAuthenticated ? <>{children}</> : <Navigate to="/client" replace />;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdminAuthenticated = useAuthStore((state) => state.isAdminAuthenticated);
  return isAdminAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil avec choix d'accès */}
        <Route path="/" element={<HomePage />} />

        {/* Routes Client */}
        <Route path="/client" element={<LoginPage />} />
        <Route
          path="/gallery"
          element={
            <ProtectedClientRoute>
              <PhotoGrid />
            </ProtectedClientRoute>
          }
        />

        {/* Routes Admin */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;