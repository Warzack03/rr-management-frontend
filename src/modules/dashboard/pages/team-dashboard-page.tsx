import { KeyboardBackspaceRounded, NotesRounded, ScheduleRounded, SportsSoccerRounded } from "@mui/icons-material";
import { Button, Chip, CircularProgress, Grid2, Stack } from "@mui/material";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import { formatMetricValue } from "../../../shared/utils/format-metric-value";
import { useDashboardTeam } from "../api/dashboard-hooks";
import { PositionSummaryChart } from "../components/position-summary-chart";

export function TeamDashboardPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const teamId = params.teamId ?? "";
  const seasonId = searchParams.get("seasonId");
  const teamDashboardQuery = useDashboardTeam(teamId, seasonId ? Number(seasonId) : undefined);

  if (teamDashboardQuery.isLoading) {
    return (
      <PageContainer title="Dashboard por equipo">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (teamDashboardQuery.isError || !teamDashboardQuery.data) {
    return (
      <PageContainer title="Dashboard por equipo">
        <EmptyState
          description="No hemos podido cargar el dashboard del equipo. Revisa la sesion o si el equipo sigue activo."
          title="Vista de equipo no disponible"
        />
      </PageContainer>
    );
  }

  const dashboard = teamDashboardQuery.data;

  return (
    <PageContainer
      actions={
        <Button component={Link} startIcon={<KeyboardBackspaceRounded />} to={`/dashboard${seasonId ? `?seasonId=${seasonId}` : ""}`} variant="outlined">
          Volver al dashboard general
        </Button>
      }
      description="Vista compacta de un equipo concreto para leer rapido su salud operativa y la distribucion de la plantilla."
      eyebrow={dashboard.team.code}
      title={dashboard.team.name}
    >
      <Stack spacing={3.5}>
        <Stack direction="row" spacing={1.25}>
          <Chip color="primary" label={dashboard.team.active ? "Equipo activo" : "Equipo inactivo"} />
          <Chip label={`Codigo interno: ${dashboard.team.code}`} variant="outlined" />
        </Stack>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              accent="blue"
              helper="Jugadores activos asignados actualmente"
              icon={<SportsSoccerRounded fontSize="small" />}
              label="Total activos"
              value={String(dashboard.activePlayers)}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="gold" helper="Media de niveles informados" label="Nivel medio" value={formatMetricValue(dashboard.averageLevel)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              accent="neutral"
              helper="Jugadores sin preferencia de entreno"
              icon={<ScheduleRounded fontSize="small" />}
              label="Sin entreno"
              value={String(dashboard.activePlayersWithoutTrainingPreference)}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              accent="neutral"
              helper="Jugadores con notas personales o deportivas"
              icon={<NotesRounded fontSize="small" />}
              label="Observaciones"
              value={String(dashboard.playersWithObservations)}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, lg: 7.4 }}>
            <SectionCard subtitle="Posicion principal de los jugadores del equipo" title="Resumen por posicion">
              <PositionSummaryChart data={dashboard.positionSummary} />
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 4.6 }}>
            <SectionCard subtitle="Lectura corta para el cuerpo tecnico y operativo" title="Faltantes inmediatos">
              <Stack spacing={1.25}>
                <KpiCard
                  accent="gold"
                  helper="Preferencia de entreno pendiente"
                  label="Sin entreno"
                  value={String(dashboard.activePlayersWithoutTrainingPreference)}
                />
                <KpiCard
                  accent="gold"
                  helper="Preferencia de partido pendiente"
                  label="Sin partido"
                  value={String(dashboard.activePlayersWithoutMatchPreference)}
                />
              </Stack>
            </SectionCard>
          </Grid2>
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
