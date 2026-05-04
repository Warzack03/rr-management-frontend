import { zodResolver } from "@hookform/resolvers/zod";
import { SearchRounded, SwapHorizRounded } from "@mui/icons-material";
import {
  Alert,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { Season } from "../../../shared/types/api";
import type { CurrentTeamAssignment, PendingTeamAssignment } from "../../../shared/types/api";
import { useSeasons } from "../../seasons/api/seasons-hooks";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import {
  useCreateAssignmentMutation,
  useCurrentAssignments,
  usePendingAssignments,
  useUpdateAssignmentMutation
} from "../api/assignments-hooks";
import { formatAssignmentDate, getAssignmentPersonName, getRoleLabel } from "../model/assignments-ui";

const assignmentActionSchema = z.object({
  teamId: z.coerce.number().positive("Selecciona un equipo"),
  startDate: z.string().optional()
});

type AssignmentActionValues = z.infer<typeof assignmentActionSchema>;

type SelectedAssignmentTarget =
  | { mode: "create"; person: PendingTeamAssignment }
  | { mode: "edit"; assignment: CurrentTeamAssignment }
  | null;

const PAGE_SIZE = 10;

function resolveDefaultSeason(seasons: Season[]) {
  return (
    seasons.find((season) => season.status === "CURRENT") ??
    seasons.find((season) => season.status === "PLANNING") ??
    seasons[0] ??
    null
  );
}

export function AssignmentsPage() {
  const { showSuccess } = useAppFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const selectedSeasonId = seasonId ? Number(seasonId) : undefined;
  const currentQuery = useCurrentAssignments(selectedSeasonId);
  const pendingQuery = usePendingAssignments(selectedSeasonId);
  const teamsQuery = useActiveTeams();
  const seasonsQuery = useSeasons();
  const createMutation = useCreateAssignmentMutation();
  const updateMutation = useUpdateAssignmentMutation();
  const [selectedTarget, setSelectedTarget] = useState<SelectedAssignmentTarget>(null);
  const [search, setSearch] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const actionPanelRef = useRef<HTMLDivElement | null>(null);
  const teamFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const form = useForm<AssignmentActionValues>({
    resolver: zodResolver(assignmentActionSchema),
    defaultValues: {
      teamId: 0,
      startDate: ""
    }
  });

  const isLoading = currentQuery.isLoading || pendingQuery.isLoading || teamsQuery.isLoading || seasonsQuery.isLoading;
  const hasError = currentQuery.isError || pendingQuery.isError || teamsQuery.isError || seasonsQuery.isError;

  const activeTeams = useMemo(
    () => (teamsQuery.data ?? []).slice().sort((left, right) => (left.displayOrder ?? 9999) - (right.displayOrder ?? 9999)),
    [teamsQuery.data]
  );
  const activeSeasons = seasonsQuery.data ?? [];

  useEffect(() => {
    if (activeSeasons.length > 0 && !selectedSeasonId) {
      const defaultSeason = resolveDefaultSeason(activeSeasons);
      if (!defaultSeason) {
        return;
      }
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("seasonId", String(defaultSeason.id));
      setSearchParams(nextParams, { replace: true });
      return;
    }

  }, [activeSeasons, form, searchParams, selectedSeasonId, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
    setPendingPage(1);
  }, [selectedSeasonId]);

  useEffect(() => {
    if (!selectedTarget) {
      return;
    }

    actionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      teamFieldRef.current?.focus();
    }, 150);
  }, [selectedTarget]);

  if (isLoading) {
    return (
      <PageContainer eyebrow="Operativa deportiva" title="Asignaciones">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (hasError || !currentQuery.data || !pendingQuery.data || !teamsQuery.data || !seasonsQuery.data) {
    return (
      <PageContainer eyebrow="Operativa deportiva" title="Asignaciones">
        <EmptyState
          description="No hemos podido cargar asignaciones, pendientes, equipos o temporadas activas."
          title="Modulo no disponible"
        />
      </PageContainer>
    );
  }

  const normalizedCurrentSearch = currentSearch.trim().toLowerCase();
  const filteredCurrentAssignments = currentQuery.data.filter((assignment) => {
    if (!normalizedCurrentSearch) {
      return true;
    }

    return (
      getAssignmentPersonName(assignment.person).toLowerCase().includes(normalizedCurrentSearch) ||
      assignment.person.nifValue.toLowerCase().includes(normalizedCurrentSearch) ||
      assignment.team.name.toLowerCase().includes(normalizedCurrentSearch) ||
      assignment.team.code.toLowerCase().includes(normalizedCurrentSearch)
    );
  });
  const currentPageCount = Math.max(1, Math.ceil(filteredCurrentAssignments.length / PAGE_SIZE));
  const paginatedCurrentAssignments = filteredCurrentAssignments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPendingAssignments = pendingQuery.data.filter((person) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(normalizedSearch) ||
      person.nifValue.toLowerCase().includes(normalizedSearch)
    );
  });
  const pendingPageCount = Math.max(1, Math.ceil(filteredPendingAssignments.length / PAGE_SIZE));
  const paginatedPendingAssignments = filteredPendingAssignments.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);

  const mutationError =
    createMutation.error instanceof HttpClientError
      ? createMutation.error.payload?.message ?? createMutation.error.message
      : updateMutation.error instanceof HttpClientError
        ? updateMutation.error.payload?.message ?? updateMutation.error.message
        : createMutation.error?.message ?? updateMutation.error?.message;

  const resetForm = (teamId = 0) => {
    form.reset({
      teamId,
      startDate: ""
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      teamId: values.teamId,
      seasonId: selectedSeasonId,
      startDate: values.startDate?.trim() || undefined
    };

    if (!selectedTarget) {
      return;
    }

    if (selectedTarget.mode === "create") {
      await createMutation.mutateAsync({
        personId: selectedTarget.person.personId,
        ...payload
      });
      showSuccess("Asignacion creada correctamente.");
    } else {
      await updateMutation.mutateAsync({
        assignmentId: selectedTarget.assignment.assignmentId,
        payload
      });
      showSuccess("Asignacion actualizada correctamente.");
    }

    setSelectedTarget(null);
    resetForm();
  });

  const selectCreateTarget = (person: PendingTeamAssignment) => {
    setSelectedTarget({ mode: "create", person });
    resetForm();
  };

  const selectEditTarget = (assignment: CurrentTeamAssignment) => {
    setSelectedTarget({ mode: "edit", assignment });
    form.reset({
      teamId: assignment.team.id,
      startDate: assignment.startDate
    });
  };

  return (
      <PageContainer
      description="Pendientes sin equipo y asignaciones activas dentro de la temporada seleccionada."
      eyebrow="Operativa deportiva"
      title="Asignaciones"
    >
      <Stack spacing={3}>
        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="blue" helper="Asignaciones activas en la temporada" label="Activas" value={String(currentQuery.data.length)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="gold" helper="Personas pendientes en la temporada" label="Pendientes" value={String(pendingQuery.data.length)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack component={Link} sx={{ color: "inherit", display: "block", textDecoration: "none" }} to="/teams">
              <KpiCard accent="neutral" helper="Equipos disponibles para asignar" label="Equipos activos" value={String(activeTeams.length)} />
            </Stack>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack component={Link} sx={{ color: "inherit", display: "block", textDecoration: "none" }} to="/seasons">
              <KpiCard accent="neutral" helper="Temporadas disponibles para operar" label="Temporadas" value={String(activeSeasons.length)} />
            </Stack>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, xl: 7.5 }}>
            <Stack spacing={3}>
              <SectionCard subtitle="Asignaciones activas de la temporada seleccionada" title="Actuales">
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                    label="Buscar por nombre, NIF o equipo"
                    onChange={(event) => {
                      setCurrentSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    value={currentSearch}
                  />

                  {filteredCurrentAssignments.length === 0 ? (
                    <EmptyState
                      description="No hay asignaciones activas que cumplan la busqueda actual en la temporada seleccionada."
                      title="Sin asignaciones actuales"
                    />
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Persona</TableCell>
                          <TableCell>Equipo</TableCell>
                          <TableCell>Inicio</TableCell>
                          <TableCell>Temporada</TableCell>
                          <TableCell>Accion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedCurrentAssignments.map((assignment) => (
                          <TableRow key={assignment.assignmentId} hover>
                            <TableCell>
                              <Stack spacing={0.35}>
                                <Typography fontWeight={600}>{getAssignmentPersonName(assignment.person)}</Typography>
                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                                  {assignment.person.roles.map((role) => (
                                    <Chip key={role} label={getRoleLabel(role)} size="small" />
                                  ))}
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{assignment.team.name}</Typography>
                            </TableCell>
                            <TableCell>{formatAssignmentDate(assignment.startDate)}</TableCell>
                            <TableCell>{assignment.season?.name ?? "Sin temporada"}</TableCell>
                            <TableCell>
                              <Button onClick={() => selectEditTarget(assignment)} size="small" variant="outlined">
                                Editar asignacion
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {filteredCurrentAssignments.length > 0 && (
                    <Stack sx={{ alignItems: "center" }}>
                      <Pagination count={currentPageCount} onChange={(_event, value) => setCurrentPage(value)} page={currentPage} />
                    </Stack>
                  )}
                </Stack>
              </SectionCard>

              <SectionCard subtitle="Personas activas sin asignacion en la temporada seleccionada" title="Pendientes">
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      )
                    }}
                    label="Buscar por nombre o NIF"
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPendingPage(1);
                    }}
                    value={search}
                  />

                  {filteredPendingAssignments.length === 0 ? (
                    <EmptyState
                      description="No hay personas pendientes que cumplan la busqueda actual en esta temporada."
                      title="Sin pendientes"
                    />
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Persona</TableCell>
                          <TableCell>NIF</TableCell>
                          <TableCell>Roles</TableCell>
                          <TableCell>Accion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedPendingAssignments.map((person) => (
                          <TableRow key={person.personId} hover>
                            <TableCell>
                              <Typography fontWeight={600}>
                                {person.firstName} {person.lastName}
                              </Typography>
                            </TableCell>
                            <TableCell>{person.nifValue}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                                {person.roles.map((role) => (
                                  <Chip key={role} label={getRoleLabel(role)} size="small" />
                                ))}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Button onClick={() => selectCreateTarget(person)} size="small" variant="outlined">
                                Asignar equipo
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {filteredPendingAssignments.length > 0 && (
                    <Stack sx={{ alignItems: "center" }}>
                      <Pagination count={pendingPageCount} onChange={(_event, value) => setPendingPage(value)} page={pendingPage} />
                    </Stack>
                  )}
                </Stack>
              </SectionCard>
            </Stack>
          </Grid2>

          <Grid2 ref={actionPanelRef} size={{ xs: 12, xl: 4.5 }}>
            <SectionCard
              action={<SwapHorizRounded color="primary" />}
              subtitle="El equipo es obligatorio. La temporada viene dada por el contexto seleccionado y la fecha es opcional."
              title={selectedTarget?.mode === "edit" ? "Editar asignacion" : "Asignar equipo"}
            >
              {!selectedTarget ? (
                <EmptyState
                  description="Selecciona una persona pendiente o una asignacion actual para abrir la accion de trabajo."
                  title="Sin accion seleccionada"
                />
              ) : (
                <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
                  {mutationError && <Alert severity="error">{mutationError}</Alert>}

                  <Stack spacing={0.5}>
                    <Typography variant="h5">
                      {selectedTarget.mode === "create"
                        ? `${selectedTarget.person.firstName} ${selectedTarget.person.lastName}`
                        : getAssignmentPersonName(selectedTarget.assignment.person)}
                    </Typography>
                    <Typography color="text.secondary">
                      {selectedTarget.mode === "create"
                        ? "Pendiente sin equipo actual"
                        : `Equipo actual: ${selectedTarget.assignment.team.name}`}
                    </Typography>
                  </Stack>

                  <TextField
                    error={!!form.formState.errors.teamId}
                    fullWidth
                    helperText={form.formState.errors.teamId?.message}
                    inputRef={teamFieldRef}
                    label="Equipo destino"
                    required
                    select
                    value={form.watch("teamId") || 0}
                    onChange={(event) =>
                      form.setValue("teamId", Number(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true
                      })
                    }
                  >
                    <MenuItem value={0}>Selecciona un equipo</MenuItem>
                    {activeTeams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    disabled
                    fullWidth
                    label="Temporada"
                    value={activeSeasons.find((season) => season.id === selectedSeasonId)?.name ?? "Sin temporada seleccionada"}
                  />

                  <TextField
                    {...form.register("startDate")}
                    fullWidth
                    helperText={
                      selectedTarget.mode === "create"
                        ? "Si no se informa, se usa la fecha actual."
                        : "Puedes corregir la fecha de inicio si es necesario."
                    }
                    label="Fecha de inicio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                    <Button
                      onClick={() => {
                        setSelectedTarget(null);
                        resetForm();
                      }}
                      variant="outlined"
                    >
                      Cancelar
                    </Button>
                    <Button disabled={createMutation.isPending || updateMutation.isPending} type="submit" variant="contained">
                      {selectedTarget.mode === "create" ? "Crear asignacion" : "Guardar cambios"}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </SectionCard>
          </Grid2>
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
