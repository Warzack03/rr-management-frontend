import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthMe, isUnauthorized } from "../api/auth-hooks";

export function AuthGuard() {
  const location = useLocation();
  const authQuery = useAuthMe();

  if (authQuery.isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (authQuery.error && isUnauthorized(authQuery.error)) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (authQuery.error) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
