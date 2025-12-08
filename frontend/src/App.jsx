// src/App.jsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// lazy pages
const Landing = lazy(() => import("./pages/index"));
const Register = lazy(() => import("./pages/register"));
const Login = lazy(() => import("./pages/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));

const KYCStep1 = lazy(() => import("./pages/kyc-step1"));
const KYCStep2 = lazy(() => import("./pages/kyc-step2"));
const KYCStep3 = lazy(() => import("./pages/kyc-step3"));
const KYCStep4 = lazy(() => import("./pages/kyc-step4"));
const KYCStep5 = lazy(() => import("./pages/kyc-step5"));
const Result = lazy(() => import("./pages/result"));

// Protected route
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
          <Routes>

            {/* Public pages that already contain their own header/footer */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard is protected but uses its own header so render it directly */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* KYC steps share the Layout (header/footer from Layout) */}
            <Route element={<Layout />}>
              <Route
                path="/kyc-step1"
                element={
                  <ProtectedRoute>
                    <KYCStep1 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-step2"
                element={
                  <ProtectedRoute>
                    <KYCStep2 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-step3"
                element={
                  <ProtectedRoute>
                    <KYCStep3 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-step4"
                element={
                  <ProtectedRoute>
                    <KYCStep4 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc-step5"
                element={
                  <ProtectedRoute>
                    <KYCStep5 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <ProtectedRoute>
                    <Result />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
