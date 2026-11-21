import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
export default function GuestRoute() {
  const status = useAppSelector(state => state.auth.status);
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
