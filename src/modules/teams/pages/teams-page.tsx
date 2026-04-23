import { zodResolver } from "@hookform/resolvers/zod";
import { AddRounded, EditRounded } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Grid2,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import { useActiveTeams, useCreateTeamMutation, useDeactivateTeamMutation, useInactiveTeams, useUpdateTeamMutation } from "../api/teams-hooks";
import type { Team } from "../../../shared/types/api";
import { getTeamBranchLabel, getTeamCrestSrc } from "../model/teams-ui";

const teamSchema = z.object({
  name: z.string().trim().min(1, "Introduce el nombre"),
  displayOrder: z.coerce.number().int().min(1, "Introduce el orden"),
  active: z.boolean(),
  branch: z.enum(["MAD", "CAT"])
});

type TeamFormValues = z.infer<typeof teamSchema>;

export function TeamsPage() {
  const { showSuccess } = useAppFeedback();
  const navigate = useNavigate();
  const activeTeamsQuery = useActiveTeams();
  const inactiveTeamsQuery = useInactiveTeams();
  const createTeamMutation = useCreateTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const deactivateTeamMutation = useDeactivateTeamMutation();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      displayOrder: 1,
      active: true,
      branch: "MAD"
    }
  });
  const nameValue = form.watch("name");
  const displayOrderValue = form.watch("displayOrder");
  const activeValue = form.watch("active");
  const branchValue = form.watch("branch");

  const activeTeams = useMemo(
    () =>
      (activeTeamsQuery.data ?? []).slice().sort((left, right) => {
        const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.name.localeCompare(right.name, "es");
      }),
    [activeTeamsQuery.data]
  );
  const inactiveTeams = useMemo(
    () =>
      (inactiveTeamsQuery.data ?? []).slice().sort((left, right) => {
        const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.name.localeCompare(right.name, "es");
      }),
    [inactiveTeamsQuery.data]
  );

  useEffect(() => {
    if (!selectedTeam) {
      form.reset({
        name: "",
        displayOrder: 1,
        active: true,
        branch: "MAD"
      });
      return;
    }

    form.reset({
      name: selectedTeam.name,
      displayOrder: selectedTeam.displayOrder ?? 1,
      active: selectedTeam.active,
      branch: selectedTeam.branch
    });
  }, [form, selectedTeam]);

  if (activeTeamsQuery.isLoading || inactiveTeamsQuery.isLoading) {
    return (
      <PageContainer eyebrow="Operativa estructural" title="Equipos">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (activeTeamsQuery.isError || inactiveTeamsQuery.isError || !activeTeamsQuery.data || !inactiveTeamsQuery.data) {
    return (
      <PageContainer eyebrow="Operativa estructural" title="Equipos">
        <EmptyState
          description="No hemos podido cargar la configuracion de equipos."
          title="Modulo no disponible"
        />
      </PageContainer>
    );
  }

  const mutationError =
    createTeamMutation.error instanceof HttpClientError
      ? createTeamMutation.error.payload?.message ?? createTeamMutation.error.message
      : updateTeamMutation.error instanceof HttpClientError
        ? updateTeamMutation.error.payload?.message ?? updateTeamMutation.error.message
        : deactivateTeamMutation.error instanceof HttpClientError
          ? deactivateTeamMutation.error.payload?.message ?? deactivateTeamMutation.error.message
          : createTeamMutation.error?.message ?? updateTeamMutation.error?.message ?? deactivateTeamMutation.error?.message;

  const resetForm = () => {
    setSelectedTeam(null);
    form.reset({
      name: "",
      displayOrder: 1,
      active: true,
      branch: "MAD"
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      displayOrder: values.displayOrder,
      active: values.active,
      branch: values.branch
    };

    if (selectedTeam) {
      await updateTeamMutation.mutateAsync({
        teamId: selectedTeam.id,
        payload
      });
      showSuccess("Equipo actualizado correctamente.");
    } else {
      await createTeamMutation.mutateAsync(payload);
      showSuccess("Equipo creado correctamente.");
    }

    resetForm();
  });

  const toggleTeamActive = async (team: Team, nextActive: boolean) => {
    if (nextActive) {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        payload: {
          name: team.name,
          displayOrder: team.displayOrder ?? 1,
          active: true,
          branch: team.branch
        }
      });
      showSuccess("Equipo activado correctamente.");
      return;
    }

    await deactivateTeamMutation.mutateAsync(team.id);
    showSuccess("Equipo desactivado correctamente.");
  };

  return (
    <PageContainer
      description="Gestiona el maestro de equipos del club, su orden de visualizacion y su disponibilidad operativa."
      eyebrow="Operativa estructural"
      title="Equipos"
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, xl: 7.2 }}>
          <Stack spacing={3}>
            <SectionCard subtitle={`${activeTeams.length} equipos activos`} title="Activos">
              {activeTeams.length === 0 ? (
                <EmptyState description="No hay equipos activos en este momento." title="Sin equipos activos" />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={60}></TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell>Sede</TableCell>
                      <TableCell>Jugadores activos asignados</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeTeams.map((team) => (
                      <TableRow
                        key={team.id}
                        hover
                        sx={{
                          cursor: "pointer"
                        }}
                        onClick={() => navigate(`/dashboard/teams/${team.id}`)}
                      >
                        <TableCell>
                          <Avatar
                            src={getTeamCrestSrc(team.branch)}
                            sx={{ width: 28, height: 28, bgcolor: "rgba(58, 104, 168, 0.08)" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} sx={{ color: "primary.main" }}>{team.name}</Typography>
                        </TableCell>
                        <TableCell>{getTeamBranchLabel(team.branch)}</TableCell>
                        <TableCell>{team.hasActivePlayersInCurrentSeason ? "Si" : "No"}</TableCell>
                        <TableCell>{team.displayOrder ?? "-"}</TableCell>
                        <TableCell>
                          <Chip color="success" label="Activo" size="small" />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar equipo">
                              <IconButton
                                aria-label={`Editar ${team.name}`}
                                color="primary"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedTeam(team);
                                }}
                                size="small"
                              >
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={team.active ? "Desactivar equipo" : "Activar equipo"}>
                              <Switch
                                checked={team.active}
                                color="error"
                                disabled={deactivateTeamMutation.isPending || updateTeamMutation.isPending}
                                inputProps={{ "aria-label": `Cambiar estado de ${team.name}` }}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event, checked) => {
                                  event.stopPropagation();
                                  void toggleTeamActive(team, checked);
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>

            <SectionCard subtitle={`${inactiveTeams.length} equipos inactivos`} title="Inactivos">
              {inactiveTeams.length === 0 ? (
                <EmptyState description="No hay equipos inactivos ahora mismo." title="Sin equipos inactivos" />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={60}></TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell>Sede</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inactiveTeams.map((team) => (
                      <TableRow key={team.id} hover>
                        <TableCell>
                          <Avatar
                            src={getTeamCrestSrc(team.branch)}
                            sx={{ width: 28, height: 28, bgcolor: "rgba(58, 104, 168, 0.08)" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{team.name}</Typography>
                        </TableCell>
                        <TableCell>{getTeamBranchLabel(team.branch)}</TableCell>
                        <TableCell>{team.displayOrder ?? "-"}</TableCell>
                        <TableCell>
                          <Chip label="Inactivo" size="small" />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Editar equipo">
                              <IconButton
                                aria-label={`Editar ${team.name}`}
                                color="primary"
                                onClick={() => setSelectedTeam(team)}
                                size="small"
                              >
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={team.active ? "Desactivar equipo" : "Activar equipo"}>
                              <Switch
                                checked={team.active}
                                color="error"
                                disabled={deactivateTeamMutation.isPending || updateTeamMutation.isPending}
                                inputProps={{ "aria-label": `Cambiar estado de ${team.name}` }}
                                onChange={(_, checked) => {
                                  void toggleTeamActive(team, checked);
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </Stack>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 4.8 }}>
          <SectionCard
            action={<AddRounded color="primary" />}
            subtitle="Crea un equipo nuevo o ajusta uno ya existente."
            title={selectedTeam ? "Editar equipo" : "Nuevo equipo"}
          >
            <Stack autoComplete="off" component="form" noValidate onSubmit={onSubmit} spacing={2}>
              {mutationError && <Alert severity="error">{mutationError}</Alert>}

              <TextField
                error={!!form.formState.errors.name}
                fullWidth
                helperText={form.formState.errors.name?.message}
                label="Nombre"
                required
                value={nameValue}
                onChange={(event) =>
                  form.setValue("name", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              />
              <TextField
                error={!!form.formState.errors.displayOrder}
                fullWidth
                helperText={form.formState.errors.displayOrder?.message}
                label="Orden de visualizacion"
                required
                type="number"
                value={displayOrderValue}
                onChange={(event) =>
                  form.setValue("displayOrder", Number(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              />
              <TextField
                fullWidth
                label="Estado"
                required
                select
                value={String(activeValue)}
                onChange={(event) =>
                  form.setValue("active", event.target.value === "true", {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Sede"
                required
                select
                value={branchValue}
                onChange={(event) =>
                  form.setValue("branch", event.target.value as "MAD" | "CAT", {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              >
                <MenuItem value="MAD">MAD</MenuItem>
                <MenuItem value="CAT">CAT</MenuItem>
              </TextField>

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                <Button onClick={resetForm} variant="outlined">
                  {selectedTeam ? "Cancelar" : "Limpiar"}
                </Button>
                <Button disabled={createTeamMutation.isPending || updateTeamMutation.isPending} type="submit" variant="contained">
                  {selectedTeam ? "Guardar cambios" : "Crear equipo"}
                </Button>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
}
