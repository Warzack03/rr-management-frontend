import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { tokens } from "../theme/tokens";

export function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar
        isDesktop={isDesktop}
        mobileOpen={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { xs: 0, lg: `${tokens.layout.sidebarWidth}px` }
        }}
      >
        <AppHeader
          isDesktop={isDesktop}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
        />
        <Toolbar
          sx={{
            minHeight: { xs: "132px !important", sm: "84px !important" }
          }}
        />
        <Outlet />
      </Box>
    </Box>
  );
}
