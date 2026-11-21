import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { User } from "../../types/auth.types";

type Props = {
  role: User["role"];
};

export default function ProtectedRoleRoute({ role }: Props) {
  const { status, user } = useAppSelector((state) => state.auth);

  if (status !== "authenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}