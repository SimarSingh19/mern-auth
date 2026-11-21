import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
export default function ProtectedRoute() {
  const status = useAppSelector(state => state.auth.status);
  return status === "authenticated" ? <Outlet /> : <Navigate to="/login" replace />;
}
