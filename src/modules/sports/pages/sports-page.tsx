import { zodResolver } from "@hookform/resolvers/zod";
import { SearchRounded, SportsSoccerRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid2,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { MatchPreference, PlayerPosition, Season, TrainingPreference } from "../../../shared/types/api";
import { useCurrentAssignments } from "../../assignments/api/assignments-hooks";
import { usePersons } from "../../persons/api/persons-hooks";
import { usePlayerProfile, useUpdatePlayerProfileMutation } from "../../player-profiles/api/player-profiles-hooks";
import { useSeasons } from "../../seasons/api/seasons-hooks";
import {
  getMatchPreferenceLabel,
  getPositionLabel,
  getTrainingPreferenceLabel,
  matchPreferenceOptions,
  playerPositionOptions,
  trainingPreferenceOptions
} from "../model/sports-ui";

const PAGE_SIZE = 10;

function resolveDefaultSeason(seasons: Season[]) {
  return (
    seasons.find((season) => season.status === "CURRENT") ??
    seasons.find((season) => season.status === "PLANNING") ??
    seasons[0] ??
    null
  );
}

const sportsFormSchema = z.object({
  primaryPosition: z.enum(["PORTERO", "DEFENSA_CENTRAL", "DEFENSA_LATERAL", "CENTROCAMPISTA", "BANDA", "DELANTERO"]).nullable(),
  secondaryPosition: z.enum(["PORTERO", "DEFENSA_CENTRAL", "DEFENSA_LATERAL", "CENTROCAMPISTA", "BANDA", "DELANTERO"]).nullable(),
  tertiaryPosition: z.enum(["PORTERO", "DEFENSA_CENTRAL", "DEFENSA_LATERAL", "CENTROCAMPISTA", "BANDA", "DELANTERO"]).nullable(),
  trainingPreference: z.enum(["LUNES_Y_MIERCOLES_16_30_18_00", "MIERCOLES_20_00_21_00_Y_VIERNES_20_30_22_30", "INDIFERENTE"]).nullable(),
  matchPreference: z.enum(["SABADO_TARDE", "DOMINGO_MANANA", "DOMINGO_TARDE", "INDIFERENTE"]).nullable(),
  level: z.union([z.coerce.number().int().min(1, "Minimo 1").max(10, "Maximo 10"), z.null()]),
  sportsNotes: z.string().optional()
});

type SportsFormValues = z.infer<typeof sportsFormSchema>;

export function SportsPage() {
  const { showSuccess } = useAppFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const selectedSeasonId = seasonId ? Number(seasonId) : undefined;
  const seasonsQuery = useSeasons();
  const personsQuery = usePersons();
  const assignmentsQuery = useCurrentAssignments(selectedSeasonId);
  const [search, setSearch] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [page, setPage] = useState(1);
  const form = useForm<SportsFormValues>({
    resolver: zodResolver(sportsFormSchema),
    defaultValues: {
      primaryPosition: null,
      secondaryPosition: null,
      tertiaryPosition: null,
      trainingPreference: null,
      matchPreference: null,
      level: null,
      sportsNotes: ""
    }
  });

  useEffect(() => {
    const seasons = seasonsQuery.data ?? [];
    if (seasons.length === 0 || selectedSeasonId) {
      return;
    }

    const defaultSeason = resolveDefaultSeason(seasons);
    if (!defaultSeason) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("seasonId", String(defaultSeason.id));
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, seasonsQuery.data, selectedSeasonId, setSearchParams]);

  const sportsCandidates = useMemo(() => {
    const persons = personsQuery.data ?? [];
    const currentAssignments = assignmentsQuery.data ?? [];
    const assignmentByPersonId = new Map(currentAssignments.map((assignment) => [assignment.person.id, assignment.team]));

    return persons
      .filter((person) => person.hasPlayerProfile)
      .map((person) => ({
        ...person,
        currentTeam: assignmentByPersonId.get(person.id) ?? null
      }))
      .sort((left, right) => `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`));
  }, [assignmentsQuery.data, personsQuery.data]);

  useEffect(() => {
    if (!selectedPersonId && sportsCandidates.length > 0) {
      setSelectedPersonId(String(sportsCandidates[0].id));
    }

    if (selectedPersonId && !sportsCandidates.some((person) => String(person.id) === selectedPersonId)) {
      setSelectedPersonId(sportsCandidates[0] ? String(sportsCandidates[0].id) : "");
    }
  }, [selectedPersonId, sportsCandidates]);

  const selectedProfileQuery = usePlayerProfile(selectedPersonId, selectedSeasonId);
  const updateMutation = useUpdatePlayerProfileMutation(selectedPersonId, selectedSeasonId);

  useEffect(() => {
    if (!selectedProfileQuery.data) {
      return;
    }

    form.reset({
      primaryPosition: selectedProfileQuery.data.primaryPosition,
      secondaryPosition: selectedProfileQuery.data.secondaryPosition,
      tertiaryPosition: selectedProfileQuery.data.tertiaryPosition,
      trainingPreference: selectedProfileQuery.data.trainingPreference,
      matchPreference: selectedProfileQuery.data.matchPreference,
      level: selectedProfileQuery.data.level,
      sportsNotes: selectedProfileQuery.data.sportsNotes ?? ""
    });
  }, [form, selectedProfileQuery.data]);

  const filteredCandidates = sportsCandidates.filter((person) => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return true;
    }

    return (
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(normalizedSearch) ||
      person.nifValue.toLowerCase().includes(normalizedSearch)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const paginatedCandidates = filteredCandidates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, selectedSeasonId]);

  const loadingBase = personsQuery.isLoading || assignmentsQuery.isLoading || seasonsQuery.isLoading;
  const errorBase = personsQuery.isError || assignmentsQuery.isError || seasonsQuery.isError;

  if (loadingBase) {
    return (
      <PageContainer eyebrow="Operativa por temporada" title="Gestion deportiva">
        <Stack
          sx={{
            minHeight: 320,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (errorBase || !personsQuery.data || !assignmentsQuery.data || !seasonsQuery.data) {
    return (
      <PageContainer eyebrow="Operativa por temporada" title="Gestion deportiva">
        <EmptyState
          description="No hemos podido cargar personas, asignaciones o temporadas para armar la mesa deportiva."
          title="Modulo deportivo no disponible"
        />
      </PageContainer>
    );
  }

  const updateError =
    updateMutation.error instanceof HttpClientError
      ? updateMutation.error.payload?.message ?? updateMutation.error.message
      : updateMutation.error?.message;

  const selectedCandidate = sportsCandidates.find((person) => String(person.id) === selectedPersonId) ?? null;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selectedPersonId) {
      return;
    }

    await updateMutation.mutateAsync({
      primaryPosition: values.primaryPosition,
      secondaryPosition: values.secondaryPosition,
      tertiaryPosition: values.tertiaryPosition,
      trainingPreference: values.trainingPreference,
      matchPreference: values.matchPreference,
      level: values.level,
      sportsNotes: values.sportsNotes?.trim() ? values.sportsNotes.trim() : null
    });

    showSuccess("Perfil deportivo guardado correctamente.");
  });

  return (
    <PageContainer
      description="Mesa de trabajo para editar el perfil deportivo de jugadores en la temporada seleccionada."
      eyebrow="Operativa por temporada"
      title="Gestion deportiva"
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, xl: 4 }}>
          <SectionCard subtitle={`${filteredCandidates.length} perfiles deportivos disponibles`} title="Jugadores">
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

              {filteredCandidates.length === 0 ? (
                <EmptyState
                  description="No hay jugadores con perfil deportivo que cumplan la busqueda actual."
                  title="Sin resultados"
                />
              ) : (
                <List disablePadding sx={{ display: "grid", gap: 1 }}>
                  {paginatedCandidates.map((person) => (
                    <ListItemButton
                      key={person.id}
                      onClick={() => setSelectedPersonId(String(person.id))}
                      selected={String(person.id) === selectedPersonId}
                      sx={{ borderRadius: 3, alignItems: "flex-start" }}
                    >
                      <ListItemText
                        primary={`${person.firstName} ${person.lastName}`}
                        secondary={
                          <Stack spacing={0.6} sx={{ mt: 0.6 }}>
                            <Typography color="text.secondary" variant="body2">
                              {person.nifValue}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {person.currentTeam ? person.currentTeam.name : "Sin equipo en la temporada"}
                            </Typography>
                          </Stack>
                        }
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}

              {filteredCandidates.length > 0 && (
                <Stack sx={{ alignItems: "center" }}>
                  <Pagination count={pageCount} onChange={(_event, value) => setPage(value)} page={page} />
                </Stack>
              )}
            </Stack>
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 8 }}>
          {!selectedPersonId ? (
            <EmptyState
              description="Selecciona un jugador de la columna izquierda para editar su informacion deportiva."
              title="Sin perfil seleccionado"
            />
          ) : selectedProfileQuery.isLoading ? (
            <SectionCard subtitle="Cargando informacion del perfil seleccionado" title="Perfil deportivo">
              <Stack
                sx={{
                  minHeight: 240,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <CircularProgress />
              </Stack>
            </SectionCard>
          ) : selectedProfileQuery.isError || !selectedProfileQuery.data || !selectedCandidate ? (
            <EmptyState
              description="No hemos podido cargar el perfil seleccionado para la temporada activa en pantalla."
              title="Perfil no disponible"
            />
          ) : (
            <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
              {updateError && <Alert severity="error">{updateError}</Alert>}

              <SectionCard
                subtitle="Resumen actual de la ficha deportiva en la temporada seleccionada"
                title={`${selectedProfileQuery.data.person.firstName} ${selectedProfileQuery.data.person.lastName}`}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      color="primary"
                      icon={<SportsSoccerRounded />}
                      label={selectedProfileQuery.data.currentTeam?.name ?? "Sin equipo en la temporada"}
                    />
                    <Chip
                      label={selectedProfileQuery.data.incomplete ? "Perfil incompleto" : "Perfil completo"}
                      variant={selectedProfileQuery.data.incomplete ? "filled" : "outlined"}
                    />
                  </Stack>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">Posicion principal</Typography>
                      <Typography>{getPositionLabel(selectedProfileQuery.data.primaryPosition)}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">Preferencia de entreno</Typography>
                      <Typography>{getTrainingPreferenceLabel(selectedProfileQuery.data.trainingPreference)}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">Preferencia de partido</Typography>
                      <Typography>{getMatchPreferenceLabel(selectedProfileQuery.data.matchPreference)}</Typography>
                    </Grid2>
                  </Grid2>
                </Stack>
              </SectionCard>

              <SectionCard subtitle="Actualiza la informacion deportiva del jugador" title="Editar perfil">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Posicion principal"
                      select
                      value={form.watch("primaryPosition") ?? ""}
                      onChange={(event) =>
                        form.setValue("primaryPosition", (event.target.value || null) as PlayerPosition | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {playerPositionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Posicion secundaria"
                      select
                      value={form.watch("secondaryPosition") ?? ""}
                      onChange={(event) =>
                        form.setValue("secondaryPosition", (event.target.value || null) as PlayerPosition | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {playerPositionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Posicion terciaria"
                      select
                      value={form.watch("tertiaryPosition") ?? ""}
                      onChange={(event) =>
                        form.setValue("tertiaryPosition", (event.target.value || null) as PlayerPosition | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {playerPositionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>

                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Preferencia de entreno"
                      select
                      value={form.watch("trainingPreference") ?? ""}
                      onChange={(event) =>
                        form.setValue("trainingPreference", (event.target.value || null) as TrainingPreference | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {trainingPreferenceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Preferencia de partido"
                      select
                      value={form.watch("matchPreference") ?? ""}
                      onChange={(event) =>
                        form.setValue("matchPreference", (event.target.value || null) as MatchPreference | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {matchPreferenceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      error={!!form.formState.errors.level}
                      fullWidth
                      helperText={form.formState.errors.level?.message}
                      label="Nivel"
                      type="number"
                      value={form.watch("level") ?? ""}
                      onChange={(event) =>
                        form.setValue("level", event.target.value === "" ? null : Number(event.target.value), {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                      }
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Notas deportivas"
                      minRows={5}
                      multiline
                      {...form.register("sportsNotes")}
                    />
                  </Grid2>
                </Grid2>

                <Divider />

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                  <Button
                    onClick={() =>
                      form.reset({
                        primaryPosition: selectedProfileQuery.data.primaryPosition,
                        secondaryPosition: selectedProfileQuery.data.secondaryPosition,
                        tertiaryPosition: selectedProfileQuery.data.tertiaryPosition,
                        trainingPreference: selectedProfileQuery.data.trainingPreference,
                        matchPreference: selectedProfileQuery.data.matchPreference,
                        level: selectedProfileQuery.data.level,
                        sportsNotes: selectedProfileQuery.data.sportsNotes ?? ""
                      })
                    }
                    variant="outlined"
                  >
                    Revertir cambios
                  </Button>
                  <Button disabled={updateMutation.isPending} type="submit" variant="contained">
                    Guardar perfil deportivo
                  </Button>
                </Stack>
              </SectionCard>
            </Stack>
          )}
        </Grid2>
      </Grid2>
    </PageContainer>
  );
}
