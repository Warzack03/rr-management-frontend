import { AccountBalanceWalletRounded, SearchRounded, SettingsRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid2,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { useDebouncedValue } from "../../../shared/hooks/use-debounced-value";
import { PageContainer } from "../../../shared/layout/page-container";
import { normalizeSearchText } from "../../../shared/utils/normalize-search-text";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import { useTreasuryPersons } from "../api/treasury-hooks";
import { TreasuryPaymentStatusChip } from "../components/treasury-payment-status-chip";
import { formatCurrency, getTreasuryPlayerConditionLabel, treasuryConditionOptions, treasuryStatusOptions } from "../model/treasury-ui";

const PAGE_SIZE = 20;

export function TreasuryPage() {
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const resolvedSeasonId = seasonId ? Number(seasonId) : undefined;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const debouncedNameFilter = useDebouncedValue(nameFilter, 250);
  const [page, setPage] = useState(1);
  const personsQuery = useTreasuryPersons({
    seasonId: resolvedSeasonId,
    status: undefined,
    search: undefined
  });
  const activeTeamsQuery = useActiveTeams();

  const persons = personsQuery.data ?? [];
  const activeTeams = activeTeamsQuery.data ?? [];
  const seasonQuery = resolvedSeasonId ? `?seasonId=${resolvedSeasonId}` : "";

  useEffect(() => {
    setPage(1);
  }, [conditionFilter, debouncedNameFilter, resolvedSeasonId, statusFilter, teamFilter]);

  const filteredRows = useMemo(() => {
    const normalizedNameFilter = normalizeSearchText(debouncedNameFilter);

    return persons.filter((row) => {
      const matchesName =
        normalizedNameFilter.length === 0 ||
        normalizeSearchText(row.fullName).includes(normalizedNameFilter) ||
        normalizeSearchText(row.nifValue).includes(normalizedNameFilter);

      const matchesTeam = teamFilter === "ALL" || row.currentTeamCode === teamFilter;

      const matchesCondition =
        conditionFilter === "ALL" ||
        row.playerCondition === conditionFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && row.totalPending > 0) ||
        (statusFilter === "OVERDUE" && row.totalOverdue > 0) ||
        (statusFilter === "UP_TO_DATE" && row.totalPending === 0);

      return matchesName && matchesTeam && matchesCondition && matchesStatus;
    });
  }, [conditionFilter, debouncedNameFilter, persons, statusFilter, teamFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRows, page]);
  const filteredSummary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.totalExpected += row.totalExpected;
        acc.totalCollected += row.totalCollected;
        acc.totalPending += row.totalPending;
        acc.totalOverdue += row.totalOverdue;

        if (row.totalPending > 0) {
          acc.peopleWithDebt += 1;
        } else {
          acc.peopleUpToDate += 1;
        }

        return acc;
      },
      {
        totalExpected: 0,
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        peopleWithDebt: 0,
        peopleUpToDate: 0
      }
    );
  }, [filteredRows]);

  if (personsQuery.isLoading || activeTeamsQuery.isLoading) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Tesoreria">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (personsQuery.isError || activeTeamsQuery.isError) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Tesoreria">
        <EmptyState
          description="No hemos podido cargar la operativa economica. Revisa la sesion y vuelve a intentarlo."
          title="Tesoreria no disponible"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Button component={Link} startIcon={<SettingsRounded />} to={`/treasury/config${seasonQuery}`} variant="outlined">
            Configuracion
          </Button>
        </Stack>
      }
      description="Mesa principal para controlar cuotas, extras y pagos pendientes por temporada."
      eyebrow="Tesoreria V2"
      title="Tesoreria"
    >
      <Stack spacing={3.5}>
        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="blue" helper="Importe previsto segun los filtros activos" label="Previsto" value={formatCurrency(filteredSummary.totalExpected)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="neutral" helper="Importe ya registrado como cobrado" label="Cobrado" value={formatCurrency(filteredSummary.totalCollected)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="gold" helper="Saldo pendiente segun la seleccion actual" label="Pendiente" value={formatCurrency(filteredSummary.totalPending)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="gold" helper="Solo deuda ya vencida en los resultados filtrados" label="Vencido" value={formatCurrency(filteredSummary.totalOverdue)} />
          </Grid2>
        </Grid2>

        <SectionCard
          action={<AccountBalanceWalletRounded color="primary" />}
          subtitle="Filtra por nombre, equipo, condicion y estado economico sin mezclar criterios en un solo campo."
          title="Filtros operativos"
        >
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  )
                }}
                label="Nombre o documento"
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
              <TextField
                fullWidth
                label="Equipo"
                select
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {activeTeams.map((team) => (
                  <MenuItem key={team.id} value={team.code}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
              <TextField
                fullWidth
                label="Condicion"
                select
                value={conditionFilter}
                onChange={(event) => setConditionFilter(event.target.value)}
              >
                {treasuryConditionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, xl: 3 }}>
              <TextField
                fullWidth
                label="Estado"
                select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {treasuryStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
          </Grid2>
        </SectionCard>

        <SectionCard
          subtitle={`${filteredRows.length} resultados visibles - ${filteredSummary.peopleWithDebt} personas con deuda y ${filteredSummary.peopleUpToDate} al dia`}
          title="Seguimiento por persona"
        >
          {filteredRows.length === 0 ? (
            <EmptyState description="No hay personas que cumplan los filtros actuales." title="Sin resultados" />
          ) : (
            <>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Persona</TableCell>
                    <TableCell>Equipo</TableCell>
                    <TableCell>Bloque</TableCell>
                    <TableCell>Condicion</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Previsto</TableCell>
                    <TableCell align="right">Cobrado</TableCell>
                    <TableCell align="right">Pendiente</TableCell>
                    <TableCell align="right">Vencido</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={row.personId} hover>
                      <TableCell>
                        <Stack spacing={0.35}>
                          <Typography
                            component={Link}
                            sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none" }}
                            to={`/treasury/persons/${row.personId}${seasonQuery}`}
                          >
                            {row.fullName}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {row.nifValue}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.currentTeamName ?? "Sin equipo"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                          <Chip label={row.economicBlockName} size="small" />
                          {row.manualOverride && <Chip color="warning" label="Manual" size="small" />}
                        </Stack>
                      </TableCell>
                      <TableCell>{getTreasuryPlayerConditionLabel(row.playerCondition)}</TableCell>
                      <TableCell>
                        <TreasuryPaymentStatusChip overdueAmount={row.totalOverdue} pendingAmount={row.totalPending} />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.totalExpected)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalCollected)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPending)}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            color: row.totalOverdue > 0 ? "warning.main" : "text.secondary",
                            fontWeight: row.totalOverdue > 0 ? 700 : 500
                          }}
                        >
                          {formatCurrency(row.totalOverdue)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Stack sx={{ mt: 2, alignItems: "center" }}>
                <Pagination count={pageCount} onChange={(_event, value) => setPage(value)} page={page} />
              </Stack>
            </>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
