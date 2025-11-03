import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/auth.store";
import { ROUTES } from "@/shared/constants/routes";

type Props = {
  redirectTo?: string;
};

export function ProtectedRoute({ redirectTo = ROUTES.welcome }: Props) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
