import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { tokens } from "../theme/tokens";

export function AppShell() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: `${tokens.layout.sidebarWidth}px`
        }}
      >
        <AppHeader />
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
