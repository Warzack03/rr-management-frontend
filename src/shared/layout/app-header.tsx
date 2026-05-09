import {
  alpha,
  AppBar,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  useTheme,
  Typography
} from "@mui/material";
import { MenuRounded } from "@mui/icons-material";
import { useEffect, useMemo } from "react";
import { useLocation, useMatches, useSearchParams } from "react-router-dom";
import { useAuthMe } from "../../modules/auth/api/auth-hooks";
import { useSeasons } from "../../modules/seasons/api/seasons-hooks";
import { tokens } from "../theme/tokens";
import type { Season } from "../types/api";

type RouteHandle = {
  title?: string;
  subtitle?: string;
};

type AppHeaderProps = {
  isDesktop: boolean;
  onOpenNavigation: () => void;
};

export function AppHeader({ isDesktop, onOpenNavigation }: AppHeaderProps) {
  const theme = useTheme();
  const matches = useMatches();
  const location = useLocation();
  const authQuery = useAuthMe();
  const seasonsQuery = useSeasons();
  const [searchParams, setSearchParams] = useSearchParams();
  const current = [...matches].reverse().find((match) => (match.handle as RouteHandle | undefined)?.title);
  const handle = (current?.handle as RouteHandle | undefined) ?? {};
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isAssignmentsRoute = location.pathname.startsWith("/assignments");
  const isSportsRoute = location.pathname.startsWith("/sports");
  const isTreasuryRoute = location.pathname.startsWith("/treasury");
  const isLogisticsRoute = location.pathname.startsWith("/logistics");
  const hasSeasonContext = isDashboardRoute || isAssignmentsRoute || isSportsRoute || isTreasuryRoute || isLogisticsRoute;
  const seasonId = searchParams.get("seasonId");

  const currentSeason = useMemo(() => {
    const seasons = seasonsQuery.data ?? [];

    return (
      seasons.find((season: Season) => season.status === "CURRENT") ??
      seasons.find((season: Season) => season.status === "PLANNING") ??
      seasons[0] ??
      null
    );
  }, [seasonsQuery.data]);

  const selectedSeason = useMemo(
    () => (seasonsQuery.data ?? []).find((season: Season) => String(season.id) === (seasonId ?? String(currentSeason?.id ?? ""))) ?? currentSeason,
    [currentSeason, seasonId, seasonsQuery.data]
  );

  useEffect(() => {
    if (!hasSeasonContext || !currentSeason || seasonId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("seasonId", String(currentSeason.id));
    setSearchParams(nextParams, { replace: true });
  }, [currentSeason, hasSeasonContext, searchParams, seasonId, setSearchParams]);

  return (
    <AppBar
      position="fixed"
      sx={{
        ml: { xs: 0, lg: `${tokens.layout.sidebarWidth}px` },
        width: { xs: "100%", lg: `calc(100% - ${tokens.layout.sidebarWidth}px)` }
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "132px !important", sm: "84px !important" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: { xs: "flex-start", sm: "space-between" },
          gap: { xs: 1.5, sm: 3 },
          px: { xs: 2, sm: 3 },
          py: { xs: 1.25, sm: 0 }
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start", minWidth: 0, flex: { sm: 1 }, width: "100%" }}
        >
          {!isDesktop && (
            <IconButton
              aria-label="Abrir navegacion"
              edge="start"
              onClick={onOpenNavigation}
              sx={{ mt: 0.1, flexShrink: 0 }}
            >
              <MenuRounded />
            </IconButton>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: "1.2rem", sm: "1.55rem" }, lineHeight: 1.05 }}
            >
              {handle.title ?? "Rising Raimon"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                mt: 0.25,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                display: { xs: "none", sm: "block" }
              }}
            >
              {handle.subtitle ?? "Panel interno del club"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-end" }
          }}
        >
          {hasSeasonContext ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ alignItems: { xs: "stretch", sm: "center" }, width: { xs: "100%", sm: "auto" } }}
            >
              <Chip
                label={getSeasonStatusLabel(selectedSeason?.status)}
                color={getSeasonStatusColor(selectedSeason?.status)}
                variant="outlined"
                sx={{ fontWeight: 700, alignSelf: { xs: "flex-start", sm: "center" } }}
              />
              <TextField
                label="Temporada"
                select
                size="small"
                sx={{ minWidth: { sm: 220 }, width: { xs: "100%", sm: "auto" } }}
                value={seasonId ?? currentSeason?.id ?? ""}
                onChange={(event) => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set("seasonId", event.target.value);
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                {(seasonsQuery.data ?? []).map((season: Season) => (
                  <MenuItem key={season.id} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          ) : (
            <Chip
              label={authQuery.data ? `${authQuery.data.username} - ${authQuery.data.role}` : "Panel interno"}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.18 : 0.2),
                color: theme.palette.mode === "dark" ? "secondary.light" : "primary.dark",
                fontWeight: 600,
                maxWidth: "100%"
              }}
            />
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function getSeasonStatusLabel(status: Season["status"] | undefined) {
  switch (status) {
    case "CURRENT":
      return "En curso";
    case "PLANNING":
      return "Planificacion";
    case "CLOSED":
      return "Cerrada";
    default:
      return "Sin estado";
  }
}

function getSeasonStatusColor(status: Season["status"] | undefined): "success" | "warning" | "default" {
  switch (status) {
    case "CURRENT":
      return "success";
    case "PLANNING":
      return "warning";
    case "CLOSED":
      return "default";
    default:
      return "default";
  }
}
