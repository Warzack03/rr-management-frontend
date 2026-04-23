import { zodResolver } from "@hookform/resolvers/zod";
import { ContentCopyRounded, EditRounded, EventRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid2,
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
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { Season, SeasonCopyModule } from "../../../shared/types/api";
import { useCopySeasonModulesMutation, useCreateSeasonMutation, useSeasons, useUpdateSeasonMutation } from "../api/seasons-hooks";

const seasonSchema = z.object({
  name: z.string().trim().min(1, "Introduce el nombre"),
  startDate: z.string().min(1, "Introduce la fecha de inicio"),
  endDate: z.string().min(1, "Introduce la fecha de fin"),
  status: z.enum(["CURRENT", "PLANNING", "CLOSED"])
});

const copySchema = z.object({
  sourceSeasonId: z.coerce.number().positive("Selecciona la temporada origen"),
  modules: z.array(z.enum(["ASSIGNMENTS", "PLAYER_PROFILES"])).min(1, "Selecciona al menos un modulo")
});

type SeasonFormValues = z.infer<typeof seasonSchema>;
type CopyFormValues = z.infer<typeof copySchema>;

const copyModuleOptions: Array<{ value: SeasonCopyModule; label: string }> = [
  { value: "ASSIGNMENTS", label: "Asignaciones" },
  { value: "PLAYER_PROFILES", label: "Gestion deportiva" }
];

function getStatusLabel(status: Season["status"]) {
  switch (status) {
    case "CURRENT":
      return "En curso";
    case "PLANNING":
      return "Planificacion";
    case "CLOSED":
      return "Cerrada";
    default:
      return status;
  }
}

function getStatusColor(status: Season["status"]): "primary" | "warning" | "default" {
  switch (status) {
    case "CURRENT":
      return "primary";
    case "PLANNING":
      return "warning";
    default:
      return "default";
  }
}

export function SeasonsPage() {
  const { showSuccess } = useAppFeedback();
  const seasonsQuery = useSeasons();
  const createSeasonMutation = useCreateSeasonMutation();
  const updateSeasonMutation = useUpdateSeasonMutation();
  const copySeasonModulesMutation = useCopySeasonModulesMutation();
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [copyTargetSeason, setCopyTargetSeason] = useState<Season | null>(null);

  const form = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      status: "PLANNING"
    }
  });

  const copyForm = useForm<CopyFormValues>({
    resolver: zodResolver(copySchema),
    defaultValues: {
      sourceSeasonId: 0,
      modules: []
    }
  });

  const seasons = seasonsQuery.data ?? [];
  const seasonNameValue = form.watch("name");
  const seasonStartDateValue = form.watch("startDate");
  const seasonEndDateValue = form.watch("endDate");
  const seasonStatusValue = form.watch("status");

  useEffect(() => {
    if (!selectedSeason) {
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        status: "PLANNING"
      });
      return;
    }

    form.reset({
      name: selectedSeason.name,
      startDate: selectedSeason.startDate,
      endDate: selectedSeason.endDate,
      status: selectedSeason.status
    });
  }, [form, selectedSeason]);

  useEffect(() => {
    if (!copyTargetSeason) {
      copyForm.reset({
        sourceSeasonId: 0,
        modules: []
      });
      return;
    }

    const defaultSource = seasons.find((season) => season.id !== copyTargetSeason.id) ?? null;
    copyForm.reset({
      sourceSeasonId: defaultSource?.id ?? 0,
      modules: []
    });
  }, [copyForm, copyTargetSeason, seasons]);

  const currentSeasons = useMemo(() => seasons.filter((season) => season.status === "CURRENT"), [seasons]);
  const planningSeasons = useMemo(() => seasons.filter((season) => season.status === "PLANNING"), [seasons]);
  const closedSeasons = useMemo(() => seasons.filter((season) => season.status === "CLOSED"), [seasons]);

  const seasonError =
    createSeasonMutation.error instanceof HttpClientError
      ? createSeasonMutation.error.payload?.message ?? createSeasonMutation.error.message
      : updateSeasonMutation.error instanceof HttpClientError
        ? updateSeasonMutation.error.payload?.message ?? updateSeasonMutation.error.message
        : createSeasonMutation.error?.message ?? updateSeasonMutation.error?.message;

  const copyError =
    copySeasonModulesMutation.error instanceof HttpClientError
      ? copySeasonModulesMutation.error.payload?.message ?? copySeasonModulesMutation.error.message
      : copySeasonModulesMutation.error?.message;

  const onSubmit = form.handleSubmit(async (values) => {
    if (selectedSeason) {
      await updateSeasonMutation.mutateAsync({
        seasonId: selectedSeason.id,
        payload: values
      });
      showSuccess("Temporada actualizada correctamente.");
    } else {
      await createSeasonMutation.mutateAsync(values);
      showSuccess("Temporada creada correctamente.");
    }

    setSelectedSeason(null);
  });

  const onCopySubmit = copyForm.handleSubmit(async (values) => {
    if (!copyTargetSeason) {
      return;
    }

    await copySeasonModulesMutation.mutateAsync({
      targetSeasonId: copyTargetSeason.id,
      payload: {
        sourceSeasonId: values.sourceSeasonId,
        modules: values.modules
      }
    });

    showSuccess("Copia entre temporadas completada correctamente.");
    setCopyTargetSeason(null);
  });

  const renderSeasonSection = (title: string, subtitle: string, sectionSeasons: Season[]) => (
    <SectionCard subtitle={subtitle} title={title}>
      {sectionSeasons.length === 0 ? (
        <EmptyState description="No hay temporadas en este bloque." title="Sin temporadas" />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Temporada</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectionSeasons.map((season) => (
              <TableRow key={season.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{season.name}</Typography>
                </TableCell>
                <TableCell>{season.startDate}</TableCell>
                <TableCell>{season.endDate}</TableCell>
                <TableCell>
                  <Chip color={getStatusColor(season.status)} label={getStatusLabel(season.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => setSelectedSeason(season)} size="small" startIcon={<EditRounded />} variant="outlined">
                      Editar
                    </Button>
                    {season.status !== "CLOSED" && (
                      <Button
                        onClick={() => setCopyTargetSeason(season)}
                        size="small"
                        startIcon={<ContentCopyRounded />}
                        variant="outlined"
                      >
                        Copiar modulos
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );

  if (seasonsQuery.isLoading) {
    return (
      <PageContainer eyebrow="Operativa estacional" title="Temporadas">
        <EmptyState description="Cargando configuracion estacional..." title="Cargando temporadas" />
      </PageContainer>
    );
  }

  if (seasonsQuery.isError || !seasonsQuery.data) {
    return (
      <PageContainer eyebrow="Operativa estacional" title="Temporadas">
        <EmptyState description="No hemos podido cargar la configuracion de temporadas." title="Modulo no disponible" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description="Gestiona el ciclo de temporadas y reutiliza trabajo entre campañas copiando solo los modulos que te interesen."
      eyebrow="Operativa estacional"
      title="Temporadas"
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, xl: 7.5 }}>
          <Stack spacing={3}>
            {renderSeasonSection("Current", `${currentSeasons.length} temporadas en curso`, currentSeasons)}
            {renderSeasonSection("Planning", `${planningSeasons.length} temporadas en planificacion`, planningSeasons)}
            {renderSeasonSection("Closed", `${closedSeasons.length} temporadas cerradas`, closedSeasons)}
          </Stack>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 4.5 }}>
          <Stack spacing={3}>
            <SectionCard
              action={<EventRounded color="primary" />}
              subtitle="Crea una nueva temporada o ajusta una existente. Si una temporada ya esta CLOSED, el backend no permitira reabrirla."
              title={selectedSeason ? "Editar temporada" : "Nueva temporada"}
            >
              <Stack component="form" noValidate onSubmit={onSubmit} spacing={2}>
                {seasonError && <Alert severity="error">{seasonError}</Alert>}

                <TextField
                  fullWidth
                  label="Nombre"
                  value={seasonNameValue}
                  onChange={(event) =>
                    form.setValue("name", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }
                  error={!!form.formState.errors.name}
                  helperText={form.formState.errors.name?.message}
                />
                <TextField
                  fullWidth
                  label="Fecha de inicio"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={seasonStartDateValue}
                  onChange={(event) =>
                    form.setValue("startDate", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }
                  error={!!form.formState.errors.startDate}
                  helperText={form.formState.errors.startDate?.message}
                />
                <TextField
                  fullWidth
                  label="Fecha de fin"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={seasonEndDateValue}
                  onChange={(event) =>
                    form.setValue("endDate", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }
                  error={!!form.formState.errors.endDate}
                  helperText={form.formState.errors.endDate?.message}
                />
                <TextField
                  fullWidth
                  label="Status"
                  select
                  value={seasonStatusValue}
                  onChange={(event) =>
                    form.setValue("status", event.target.value as Season["status"], {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }
                >
                  <MenuItem value="CURRENT">CURRENT</MenuItem>
                  <MenuItem value="PLANNING">PLANNING</MenuItem>
                  <MenuItem value="CLOSED">CLOSED</MenuItem>
                </TextField>

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => setSelectedSeason(null)}
                    variant="outlined"
                  >
                    {selectedSeason ? "Cancelar" : "Limpiar"}
                  </Button>
                  <Button disabled={createSeasonMutation.isPending || updateSeasonMutation.isPending} type="submit" variant="contained">
                    {selectedSeason ? "Guardar cambios" : "Crear temporada"}
                  </Button>
                </Stack>
              </Stack>
            </SectionCard>

            <SectionCard
              action={<ContentCopyRounded color="primary" />}
              subtitle="Sobrescribe los modulos destino que selecciones para ahorrar trabajo entre campañas."
              title={copyTargetSeason ? `Copiar a ${copyTargetSeason.name}` : "Copia entre temporadas"}
            >
              {!copyTargetSeason ? (
                <EmptyState
                  description="Selecciona una temporada destino desde la tabla para abrir la accion de copia modular."
                  title="Sin temporada destino"
                />
              ) : (
                <Stack component="form" noValidate onSubmit={onCopySubmit} spacing={2}>
                  {copyError && <Alert severity="error">{copyError}</Alert>}

                  <TextField
                    fullWidth
                    label="Temporada origen"
                    select
                    value={copyForm.watch("sourceSeasonId") || 0}
                    onChange={(event) =>
                      copyForm.setValue("sourceSeasonId", Number(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true
                      })
                    }
                    error={!!copyForm.formState.errors.sourceSeasonId}
                    helperText={copyForm.formState.errors.sourceSeasonId?.message}
                  >
                    <MenuItem value={0}>Selecciona una temporada</MenuItem>
                    {seasons
                      .filter((season) => season.id !== copyTargetSeason.id)
                      .map((season) => (
                        <MenuItem key={season.id} value={season.id}>
                          {season.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <FormGroup>
                    {copyModuleOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            checked={copyForm.watch("modules").includes(option.value)}
                            onChange={(_event, checked) => {
                              const currentModules = copyForm.watch("modules");
                              copyForm.setValue(
                                "modules",
                                checked ? [...currentModules, option.value] : currentModules.filter((module) => module !== option.value),
                                { shouldDirty: true, shouldValidate: true }
                              );
                            }}
                          />
                        }
                        label={option.label}
                      />
                    ))}
                  </FormGroup>
                  {copyForm.formState.errors.modules && (
                    <Typography color="error" variant="body2">
                      {copyForm.formState.errors.modules.message}
                    </Typography>
                  )}

                  <Alert severity="warning">
                    La copia sobrescribira los modulos seleccionados en la temporada destino.
                  </Alert>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                    <Button onClick={() => setCopyTargetSeason(null)} variant="outlined">
                      Cancelar
                    </Button>
                    <Button disabled={copySeasonModulesMutation.isPending} type="submit" variant="contained">
                      Copiar modulos
                    </Button>
                  </Stack>
                </Stack>
              )}
            </SectionCard>
          </Stack>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
}
