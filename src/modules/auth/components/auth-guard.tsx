import { Box, CircularProgress, Stack } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
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
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2
        }}
      >
        <Stack sx={{ width: "100%", maxWidth: 720 }}>
          <EmptyState
            actionLabel="Reintentar"
            description="No hemos podido validar la sesion desde este dispositivo. Revisa que el backend este accesible desde la misma red local y vuelve a intentarlo."
            onAction={() => window.location.reload()}
            title="Conexion con la API no disponible"
          />
        </Stack>
      </Box>
    );
  }

  return <Outlet />;
}
