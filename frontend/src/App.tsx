import { Navigate, Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { restoreSession } from "./store/slices/authSlice";
import AuthLayout from "./components/auth/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";

import ProtectedRoleRoute from "./components/auth/ProtectedRoleRoute";
import AdminUsersPage from "./pages/AdminUsersPage";

import ProfilePage from "./pages/ProfilePage";


export default function App() {
  const { status, error, user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

if (status === "checking"){
  return (
    <main className="status-screen" role="status">
      <div className="spinner-border text-primary" aria-hidden="true" />
      <p className="mt-3">Checking your session…</p>
  </main>
  )
}

if (status === "error"){
  return (
    <main className="status-screen">
      <div className="card account-card p-4">
        <h1 className="h4">We couldn’t connect</h1>
        <p role="alert">{error}</p>
        <button className="btn btn-primary" onClick={() => void dispatch(restoreSession())}>Try again</button>
      </div>
    </main>
  )
}

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={user?.role === "admin" ? (<Navigate to="/admin/dashboard" replace />) : (<DashboardPage />)}/>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoleRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      
      <Route path="/" element={<Navigate to={status === "authenticated" ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<main className="status-screen"><h1>Page not found</h1><a href="/">Go home</a></main>} />
  </Routes>
  )
}
