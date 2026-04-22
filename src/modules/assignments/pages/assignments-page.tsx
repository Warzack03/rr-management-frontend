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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { CurrentTeamAssignment, PendingTeamAssignment } from "../../../shared/types/api";
import { useActiveSeasons } from "../../seasons/api/seasons-hooks";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import {
  useChangeAssignmentMutation,
  useCreateAssignmentMutation,
  useCurrentAssignments,
  usePendingAssignments
} from "../api/assignments-hooks";
import { formatAssignmentDate, getAssignmentPersonName, getRoleLabel } from "../model/assignments-ui";

const assignmentActionSchema = z.object({
  teamId: z.coerce.number().positive("Selecciona un equipo"),
  seasonId: z.coerce.number().positive("Selecciona una temporada"),
  startDate: z.string().optional()
});

type AssignmentActionValues = z.infer<typeof assignmentActionSchema>;

type SelectedAssignmentTarget =
  | { mode: "create"; person: PendingTeamAssignment }
  | { mode: "change"; assignment: CurrentTeamAssignment }
  | null;

export function AssignmentsPage() {
  const currentQuery = useCurrentAssignments();
  const pendingQuery = usePendingAssignments();
  const teamsQuery = useActiveTeams();
  const seasonsQuery = useActiveSeasons();
  const createMutation = useCreateAssignmentMutation();
  const changeMutation = useChangeAssignmentMutation();
  const [selectedTarget, setSelectedTarget] = useState<SelectedAssignmentTarget>(null);
  const [search, setSearch] = useState("");
  const form = useForm<AssignmentActionValues>({
    resolver: zodResolver(assignmentActionSchema),
    defaultValues: {
      teamId: 0,
      seasonId: 0,
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
    if (activeSeasons.length > 0 && !form.getValues("seasonId")) {
      form.setValue("seasonId", activeSeasons[0].id, {
        shouldDirty: false
      });
    }
  }, [activeSeasons, form]);

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

  const mutationError =
    createMutation.error instanceof HttpClientError
      ? createMutation.error.payload?.message ?? createMutation.error.message
      : changeMutation.error instanceof HttpClientError
        ? changeMutation.error.payload?.message ?? changeMutation.error.message
        : createMutation.error?.message ?? changeMutation.error?.message;

  const resetForm = (teamId = 0, seasonId = activeSeasons[0]?.id ?? 0) => {
    form.reset({
      teamId,
      seasonId,
      startDate: ""
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      teamId: values.teamId,
      seasonId: values.seasonId,
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
    } else {
      await changeMutation.mutateAsync({
        personId: selectedTarget.assignment.person.id,
        payload
      });
    }

    setSelectedTarget(null);
    resetForm();
  });

  const selectCreateTarget = (person: PendingTeamAssignment) => {
    setSelectedTarget({ mode: "create", person });
    resetForm();
  };

  const selectChangeTarget = (assignment: CurrentTeamAssignment) => {
    setSelectedTarget({ mode: "change", assignment });
    resetForm(assignment.team.id, assignment.season?.id ?? activeSeasons[0]?.id ?? 0);
  };

  return (
    <PageContainer
      description="Pendientes sin equipo y cambios de equipo dentro de una misma operativa rapida."
      eyebrow="Operativa deportiva"
      title="Asignaciones"
    >
      <Stack spacing={3}>
        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="blue" helper="Asignaciones activas actuales" label="Activas" value={String(currentQuery.data.length)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="gold" helper="Personas pendientes de equipo" label="Pendientes" value={String(pendingQuery.data.length)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="neutral" helper="Equipos disponibles para asignar" label="Equipos activos" value={String(activeTeams.length)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent="neutral" helper="Temporadas activas para operar" label="Temporadas" value={String(activeSeasons.length)} />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, xl: 7.5 }}>
            <Stack spacing={3}>
              <SectionCard subtitle="Asignaciones activas actuales" title="Actuales">
                {currentQuery.data.length === 0 ? (
                  <EmptyState
                    description="No hay asignaciones activas registradas ahora mismo."
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
                      {currentQuery.data.map((assignment) => (
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
                            <Typography color="text.secondary" variant="body2">
                              {assignment.team.code}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatAssignmentDate(assignment.startDate)}</TableCell>
                          <TableCell>{assignment.season?.name ?? "Sin temporada"}</TableCell>
                          <TableCell>
                            <Button onClick={() => selectChangeTarget(assignment)} size="small" variant="outlined">
                              Cambiar equipo
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </SectionCard>

              <SectionCard subtitle="Personas activas sin asignacion actual" title="Pendientes">
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
                    onChange={(event) => setSearch(event.target.value)}
                    value={search}
                  />

                  {filteredPendingAssignments.length === 0 ? (
                    <EmptyState
                      description="No hay personas pendientes que cumplan la busqueda actual."
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
                        {filteredPendingAssignments.map((person) => (
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
                </Stack>
              </SectionCard>
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 4.5 }}>
            <SectionCard
              action={<SwapHorizRounded color="primary" />}
              subtitle="Equipo y temporada son obligatorios. La fecha es opcional."
              title={selectedTarget?.mode === "change" ? "Cambiar equipo" : "Asignar equipo"}
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
                        {team.name} - {team.code}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    error={!!form.formState.errors.seasonId}
                    fullWidth
                    helperText={form.formState.errors.seasonId?.message}
                    label="Temporada"
                    required
                    select
                    value={form.watch("seasonId") || 0}
                    onChange={(event) =>
                      form.setValue("seasonId", Number(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true
                      })
                    }
                  >
                    <MenuItem value={0}>Selecciona una temporada</MenuItem>
                    {activeSeasons.map((season) => (
                      <MenuItem key={season.id} value={season.id}>
                        {season.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    {...form.register("startDate")}
                    fullWidth
                    helperText="Si no se informa, se usa la fecha actual."
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
                    <Button disabled={createMutation.isPending || changeMutation.isPending} type="submit" variant="contained">
                      {selectedTarget.mode === "create" ? "Crear asignacion" : "Aplicar cambio"}
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
