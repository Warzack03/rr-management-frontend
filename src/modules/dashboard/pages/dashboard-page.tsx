import { AccountBalanceWalletRounded, AutoGraphRounded, GroupsRounded, InfoOutlined, Inventory2Rounded, SportsScoreRounded, WarningAmberRounded } from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid2,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import { formatMetricValue } from "../../../shared/utils/format-metric-value";
import { useLogisticsRequests, useLogisticsStockSurplusReviews } from "../../logistics/api/logistics-hooks";
import { useTreasuryPersons } from "../../treasury/api/treasury-hooks";
import { useDashboardSummary } from "../api/dashboard-hooks";
import { PositionSummaryChart } from "../components/position-summary-chart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const selectedSeasonId = seasonId ? Number(seasonId) : undefined;
  const dashboardQuery = useDashboardSummary(selectedSeasonId);
  const treasuryQuery = useTreasuryPersons({ seasonId: selectedSeasonId });
  const logisticsRequestsQuery = useLogisticsRequests(selectedSeasonId);
  const surplusReviewsQuery = useLogisticsStockSurplusReviews(selectedSeasonId);

  if (dashboardQuery.isLoading) {
    return (
      <PageContainer eyebrow="MVP backoffice" title="Sala de control del club">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageContainer eyebrow="MVP backoffice" title="Sala de control del club">
        <EmptyState
          description="No hemos podido cargar el dashboard general. Revisa la sesion y vuelve a intentarlo."
          title="Dashboard no disponible ahora mismo"
        />
      </PageContainer>
    );
  }

  const dashboardSummary = dashboardQuery.data;
  const seasonQuery = seasonId ? `?seasonId=${seasonId}` : "";
  const treasurySummary = (treasuryQuery.data ?? []).reduce(
    (summary, row) => {
      summary.pending += row.totalPending;
      summary.overdue += row.totalOverdue;
      if (row.totalPending > 0) {
        summary.personsWithPending += 1;
      }
      return summary;
    },
    { pending: 0, overdue: 0, personsWithPending: 0 }
  );
  const logisticsSummary = (logisticsRequestsQuery.data ?? []).reduce(
    (summary, request) => {
      if (request.status === "PENDING_STOCK" || request.status === "PARTIALLY_RESERVED") {
        summary.pendingOrder += 1;
      }
      if (request.status === "RESERVED_FROM_STOCK") {
        summary.readyToDeliver += 1;
      }
      return summary;
    },
    { pendingOrder: 0, readyToDeliver: 0 }
  );
  const checklistLinkByCode: Record<string, string> = {
    PLAYERS_WITHOUT_TEAM: `/assignments${seasonQuery}`,
    INCOMPLETE_PLAYERS: `/sports${seasonQuery}`,
    PLAYERS_WITHOUT_TRAINING_PREFERENCE: `/sports${seasonQuery}`,
    PLAYERS_WITHOUT_MATCH_PREFERENCE: `/sports${seasonQuery}`,
    PLAYERS_WITHOUT_PRIMARY_POSITION: `/sports${seasonQuery}`,
    PLAYERS_WITHOUT_LEVEL: `/sports${seasonQuery}`
  };

  return (
    <PageContainer
      description="Vision operativa del club para detectar rapido faltantes, estados sensibles y distribucion de plantilla."
      eyebrow="MVP backoffice"
      title="Sala de control del club"
    >
      <Stack spacing={3.5}>
        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <Box component={Link} sx={{ display: "block", color: "inherit", textDecoration: "none" }} to="/persons">
              <KpiCard
                accent="blue"
                helper="Jugadores activos con rol operativo"
                icon={<GroupsRounded fontSize="small" />}
                label="Jugadores activos"
                value={String(dashboardSummary.activePlayers)}
              />
            </Box>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <Box component={Link} sx={{ display: "block", color: "inherit", textDecoration: "none" }} to={`/assignments${seasonQuery}`}>
              <KpiCard
                accent="gold"
                helper="Pendientes de ubicacion deportiva"
                icon={<SportsScoreRounded fontSize="small" />}
                label="Jugadores sin equipo"
                value={String(dashboardSummary.playersWithoutTeam)}
              />
            </Box>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <Box component={Link} sx={{ display: "block", color: "inherit", textDecoration: "none" }} to={`/sports${seasonQuery}`}>
              <KpiCard
                accent="neutral"
                helper="Jugadores con informacion a completar"
                icon={<WarningAmberRounded fontSize="small" />}
                label="Datos incompletos"
                value={String(dashboardSummary.incompletePlayers)}
              />
            </Box>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard
              accent="blue"
              helper="Media solo con niveles informados"
              icon={<AutoGraphRounded fontSize="small" />}
              label="Nivel medio"
              value={formatMetricValue(dashboardSummary.averageLevel)}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, lg: 5.4 }}>
            <SectionCard subtitle="Acceso rapido a cada dashboard compacto" title="Resumen por equipo">
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipo</TableCell>
                    <TableCell align="right">Nivel medio</TableCell>
                    <TableCell align="right">Activos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardSummary.teamSummary.map((team) => (
                    <TableRow
                      key={team.teamId}
                      hover
                      sx={{
                        "& td": {
                          borderBottomStyle: "dashed"
                        }
                      }}
                    >
                      <TableCell>
                        <Typography
                          component={Link}
                          sx={{ color: "primary.main", fontWeight: 600 }}
                          to={`/dashboard/teams/${team.teamId}${seasonId ? `?seasonId=${seasonId}` : ""}`}
                        >
                          {team.teamName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatMetricValue(team.averageLevel)}</TableCell>
                      <TableCell align="right">{team.activePlayers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 6.6 }}>
            <SectionCard subtitle="Distribucion actual por posicion principal" title="Resumen por posicion">
              <PositionSummaryChart data={dashboardSummary.positionSummary} />
            </SectionCard>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <SectionCard subtitle="Pulso rapido de cobros y operativa textil de la temporada" title="Tesoreria y logistica">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <AccountBalanceWalletRounded color="primary" fontSize="small" />
                      <Typography fontWeight={700}>Tesoreria</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip label={`${treasurySummary.personsWithPending} personas con saldo`} size="small" />
                      <Chip color="warning" label={`Vencido ${formatCurrency(treasurySummary.overdue)}`} size="small" variant="outlined" />
                    </Stack>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Pendiente total</Typography>
                      <Typography fontWeight={700}>{formatCurrency(treasurySummary.pending)}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Vencido total</Typography>
                      <Typography fontWeight={700}>{formatCurrency(treasurySummary.overdue)}</Typography>
                    </Stack>
                  </Stack>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Inventory2Rounded color="primary" fontSize="small" />
                      <Typography fontWeight={700}>Logistica</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip color="warning" label={`${logisticsSummary.pendingOrder} por pedir`} size="small" variant="outlined" />
                      <Chip color="success" label={`${logisticsSummary.readyToDeliver} para entregar`} size="small" variant="outlined" />
                    </Stack>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Pendientes de revision</Typography>
                      <Typography fontWeight={700}>{surplusReviewsQuery.data?.length ?? 0}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography color="text.secondary">Solicitudes en curso</Typography>
                      <Typography fontWeight={700}>{(logisticsRequestsQuery.data ?? []).length}</Typography>
                    </Stack>
                  </Stack>
                </Grid2>
              </Grid2>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 4 }}>
            <SectionCard
              action={<InfoOutlined color="primary" />}
              subtitle="Checklist priorizado para el trabajo diario"
              title="Pendientes operativos"
            >
              <List disablePadding>
                {dashboardSummary.checklist.map((item, index) => (
                  <ListItem
                    key={item.code}
                    disableGutters
                    sx={{
                      py: 0.8,
                      borderTop: index === 0 ? "none" : "1px dashed #D8E0EA"
                    }}
                  >
                    <Box
                      component={Link}
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "inherit",
                        textDecoration: "none"
                      }}
                      to={checklistLinkByCode[item.code] ?? `/dashboard${seasonQuery}`}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Box
                        sx={{
                          minWidth: 38,
                          height: 38,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: item.count > 0 ? "rgba(237, 203, 80, 0.24)" : "rgba(58, 104, 168, 0.1)",
                          color: item.count > 0 ? "warning.main" : "primary.main",
                          fontWeight: 700
                        }}
                      >
                        {item.count}
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid2>
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
