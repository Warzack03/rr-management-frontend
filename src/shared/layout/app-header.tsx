import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
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
  Typography
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { useLocation, useMatches, useSearchParams } from "react-router-dom";
import { useAuthMe } from "../../modules/auth/api/auth-hooks";
import { useActiveSeasons } from "../../modules/seasons/api/seasons-hooks";

type RouteHandle = {
  title?: string;
  subtitle?: string;
};

export function AppHeader() {
  const matches = useMatches();
  const location = useLocation();
  const authQuery = useAuthMe();
  const seasonsQuery = useActiveSeasons();
  const [searchParams, setSearchParams] = useSearchParams();
  const current = [...matches].reverse().find((match) => (match.handle as RouteHandle | undefined)?.title);
  const handle = (current?.handle as RouteHandle | undefined) ?? {};
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const seasonId = searchParams.get("seasonId");

  const currentSeason = useMemo(() => {
    const seasons = seasonsQuery.data ?? [];
    const today = new Date().toISOString().slice(0, 10);

    return seasons.find((season) => season.startDate <= today && season.endDate >= today) ?? seasons[0] ?? null;
  }, [seasonsQuery.data]);

  useEffect(() => {
    if (!isDashboardRoute || !currentSeason || seasonId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("seasonId", String(currentSeason.id));
    setSearchParams(nextParams, { replace: true });
  }, [currentSeason, isDashboardRoute, searchParams, seasonId, setSearchParams]);

  return (
    <AppBar position="fixed" sx={{ ml: "288px", width: "calc(100% - 288px)" }}>
      <Toolbar
        sx={{
          minHeight: "84px !important",
          display: "flex",
          justifyContent: "space-between",
          gap: 3
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4">{handle.title ?? "Rising Raimon"}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25 }}>
            {handle.subtitle ?? "Panel interno del club"}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          {isDashboardRoute ? (
            <TextField
              label="Temporada"
              select
              size="small"
              sx={{ minWidth: 220 }}
              value={seasonId ?? currentSeason?.id ?? ""}
              onChange={(event) => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set("seasonId", event.target.value);
                setSearchParams(nextParams, { replace: true });
              }}
            >
              {(seasonsQuery.data ?? []).map((season) => (
                <MenuItem key={season.id} value={season.id}>
                  {season.name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Chip
              label={authQuery.data ? `${authQuery.data.username} - ${authQuery.data.role}` : "Panel interno"}
              sx={{
                bgcolor: alpha("#EDCB50", 0.2),
                color: "primary.dark",
                fontWeight: 600
              }}
            />
          )}
          <IconButton
            sx={{
              bgcolor: "rgba(58, 104, 168, 0.08)"
            }}
          >
            <SearchRounded />
          </IconButton>
          <IconButton
            sx={{
              bgcolor: "rgba(58, 104, 168, 0.08)"
            }}
          >
            <NotificationsNoneRounded />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
