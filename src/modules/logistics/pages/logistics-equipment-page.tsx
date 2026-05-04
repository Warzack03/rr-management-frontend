import { AddRounded, CheckroomRounded, DeleteOutlineRounded, SearchRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid2,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Stack,
  Switch,
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
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type {
  CurrentTeamAssignment,
  LogisticsChargeMode,
  LogisticsGarmentCategory,
  LogisticsRequestStatus,
  PendingTeamAssignment,
  PlayerSeasonGarment,
  PlayerSeasonGarmentType,
  SleeveType
} from "../../../shared/types/api";
import { normalizeSearchText } from "../../../shared/utils/normalize-search-text";
import { useCurrentAssignments, usePendingAssignments } from "../../assignments/api/assignments-hooks";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import {
  useCreateLogisticsRequestMutation,
  useGenerateBaseRequestsMutation,
  useLogisticsExternalRecipients,
  usePlayerSeasonGarments,
  useLogisticsRequests,
  useUpdatePlayerSeasonGarmentsMutation
} from "../api/logistics-hooks";
import {
  getLogisticsGarmentLabel,
  getLogisticsRequestStatusColor,
  getLogisticsRequestStatusLabel,
  logisticsApparelSizeOptions,
  logisticsGarmentOptions,
  logisticsRequestStatusOptions,
  logisticsSocksSizeOptions,
  playerSeasonGarmentTypeOptions,
  sleeveTypeOptions
} from "../model/logistics-ui";

const PAGE_SIZE = 10;

type RequestRecipientMode = "PERSON" | "EXTERNAL";
type RosterRow = {
  personId: number;
  fullName: string;
  nifValue: string;
  currentTeamName: string | null;
};
type GarmentDraft = {
  localId: string;
  id?: number;
  garmentType: PlayerSeasonGarmentType;
  size: string;
  quantity: string;
  hasItem: boolean;
  isKept: boolean | null;
  needsItem: boolean | null;
  isExtra: boolean;
  notes: string;
  sleeveType: SleeveType | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof HttpClientError) {
    return error.payload?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return null;
}

function isSocksCategory(garmentCategory: LogisticsGarmentCategory) {
  return garmentCategory === "MATCH_SOCKS";
}

function supportsSleeveType(garmentType: PlayerSeasonGarmentType) {
  return garmentType === "PLAYER_MATCH_SHIRT" || garmentType === "TRAINING_SHIRT" || garmentType === "GOALKEEPER_MATCH_SHIRT";
}

function cycleTriStateValue(value: boolean | null): boolean | null {
  if (value === null) {
    return true;
  }
  if (value === true) {
    return false;
  }
  return null;
}

function getSizeOptionsForGarmentType(garmentType: PlayerSeasonGarmentType, currentSize: string) {
  const baseOptions: string[] = garmentType === "SOCKS" ? [...logisticsSocksSizeOptions] : [...logisticsApparelSizeOptions];
  if (currentSize && !baseOptions.includes(currentSize)) {
    return [currentSize, ...baseOptions];
  }
  return baseOptions;
}

function toGarmentDraft(garment: PlayerSeasonGarment, index: number): GarmentDraft {
  return {
    localId: `${garment.id}-${index}`,
    id: garment.id,
    garmentType: garment.garmentType,
    size: garment.size ?? "",
    quantity: String(garment.quantity),
    hasItem: garment.hasItem,
    isKept: garment.isKept,
    needsItem: garment.needsItem,
    isExtra: garment.isExtra,
    notes: garment.notes ?? "",
    sleeveType: garment.sleeveType
  };
}

function createEmptyGarmentDraft(): GarmentDraft {
  return {
    localId: `new-${crypto.randomUUID()}`,
    garmentType: "PLAYER_MATCH_SHIRT",
    size: "",
    quantity: "1",
    hasItem: false,
    isKept: null,
    needsItem: null,
    isExtra: false,
    notes: "",
    sleeveType: null
  };
}

export function LogisticsEquipmentPage() {
  const { showError, showSuccess } = useAppFeedback();
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const selectedSeasonId = seasonId ? Number(seasonId) : undefined;
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [page, setPage] = useState(1);

  const [requestStatusFilter, setRequestStatusFilter] = useState<"ALL" | LogisticsRequestStatus>("ALL");
  const [onlySelectedPersonRequests, setOnlySelectedPersonRequests] = useState(true);

  const [extraRecipientMode, setExtraRecipientMode] = useState<RequestRecipientMode>("PERSON");
  const [extraExternalRecipientName, setExtraExternalRecipientName] = useState("");
  const [extraExternalRecipientId, setExtraExternalRecipientId] = useState("");
  const [extraGarmentCategory, setExtraGarmentCategory] = useState<LogisticsGarmentCategory>("MATCH_SHIRT");
  const [extraSizeCode, setExtraSizeCode] = useState<string>("M");
  const [extraQuantity, setExtraQuantity] = useState<string>("1");
  const [extraChargeMode, setExtraChargeMode] = useState<LogisticsChargeMode>("CHARGEABLE");
  const [extraUnitAmount, setExtraUnitAmount] = useState<string>("0");
  const [extraNotes, setExtraNotes] = useState("");
  const [garmentDrafts, setGarmentDrafts] = useState<GarmentDraft[]>([]);

  const activeTeamsQuery = useActiveTeams();
  const currentAssignmentsQuery = useCurrentAssignments(selectedSeasonId);
  const pendingAssignmentsQuery = usePendingAssignments(selectedSeasonId);
  const externalRecipientsQuery = useLogisticsExternalRecipients();
  const selectedTeamId = teamFilter === "ALL" ? undefined : Number(teamFilter);
  const selectedPersonNumberId = selectedPersonId ? Number(selectedPersonId) : undefined;
  const filteredRows = useMemo(() => {
    const currentRows: RosterRow[] = (currentAssignmentsQuery.data ?? [])
      .filter((assignment: CurrentTeamAssignment) => assignment.person.roles.includes("JUGADOR"))
      .filter((assignment: CurrentTeamAssignment) => (selectedTeamId ? assignment.team.id === selectedTeamId : true))
      .map((assignment: CurrentTeamAssignment) => ({
        personId: assignment.person.id,
        fullName: `${assignment.person.firstName} ${assignment.person.lastName}`.trim(),
        nifValue: assignment.person.nifValue,
        currentTeamName: assignment.team.name
      }));

    const pendingRows: RosterRow[] = selectedTeamId
      ? []
      : (pendingAssignmentsQuery.data ?? [])
          .filter((person: PendingTeamAssignment) => person.roles.includes("JUGADOR"))
          .map((person: PendingTeamAssignment) => ({
            personId: person.personId,
            fullName: `${person.firstName} ${person.lastName}`.trim(),
            nifValue: person.nifValue,
            currentTeamName: null
          }));

    const rows = [...currentRows, ...pendingRows];
    const normalizedSearch = normalizeSearchText(search);
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      return (
        normalizeSearchText(row.fullName).includes(normalizedSearch) ||
        normalizeSearchText(row.nifValue).includes(normalizedSearch)
      );
    });
  }, [currentAssignmentsQuery.data, pendingAssignmentsQuery.data, search, selectedTeamId]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRows, page]);
  const selectedRosterRow = useMemo(
    () => filteredRows.find((row) => String(row.personId) === selectedPersonId) ?? null,
    [filteredRows, selectedPersonId]
  );

  useEffect(() => {
    setPage(1);
  }, [search, teamFilter]);

  useEffect(() => {
    if (!selectedPersonId && filteredRows.length > 0) {
      setSelectedPersonId(String(filteredRows[0].personId));
    }

    if (selectedPersonId && !filteredRows.some((row) => String(row.personId) === selectedPersonId)) {
      setSelectedPersonId(filteredRows[0] ? String(filteredRows[0].personId) : "");
    }
  }, [filteredRows, selectedPersonId]);

  const garmentsQuery = usePlayerSeasonGarments(selectedPersonNumberId, selectedSeasonId);
  const updateGarmentsMutation = useUpdatePlayerSeasonGarmentsMutation(selectedPersonNumberId, selectedSeasonId);
  const requestsQuery = useLogisticsRequests(
    selectedSeasonId,
    selectedTeamId,
    onlySelectedPersonRequests ? selectedPersonNumberId : undefined,
    requestStatusFilter === "ALL" ? undefined : requestStatusFilter
  );
  const generateBaseRequestsMutation = useGenerateBaseRequestsMutation(selectedSeasonId, selectedTeamId);
  const createExtraRequestMutation = useCreateLogisticsRequestMutation();

  useEffect(() => {
    setGarmentDrafts((garmentsQuery.data ?? []).map(toGarmentDraft));
  }, [garmentsQuery.data]);

  const loadingBase = activeTeamsQuery.isLoading || currentAssignmentsQuery.isLoading || pendingAssignmentsQuery.isLoading;
  const errorBase = activeTeamsQuery.isError || currentAssignmentsQuery.isError || pendingAssignmentsQuery.isError;
  const garmentsError = getErrorMessage(garmentsQuery.error) ?? getErrorMessage(updateGarmentsMutation.error);
  const requestError = getErrorMessage(requestsQuery.error) ?? getErrorMessage(createExtraRequestMutation.error);
  const extraSizeOptions = isSocksCategory(extraGarmentCategory) ? logisticsSocksSizeOptions : logisticsApparelSizeOptions;

  const resetGarmentDrafts = () => {
    setGarmentDrafts((garmentsQuery.data ?? []).map(toGarmentDraft));
  };

  const updateGarmentDraft = (localId: string, updater: (current: GarmentDraft) => GarmentDraft) => {
    setGarmentDrafts((current) => current.map((draft) => (draft.localId === localId ? updater(draft) : draft)));
  };

  const removeGarmentDraft = (localId: string) => {
    setGarmentDrafts((current) => current.filter((draft) => draft.localId !== localId));
  };

  const handleSaveGarments = async () => {
    if (!selectedPersonNumberId) {
      return;
    }

    const normalizedGarments = garmentDrafts.map((draft, index) => {
      const quantity = Number(draft.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`La cantidad de la fila ${index + 1} debe ser un entero mayor que cero.`);
      }

      return {
        id: draft.id,
        garmentType: draft.garmentType,
        size: draft.size.trim() ? draft.size.trim() : null,
        quantity,
        hasItem: draft.hasItem,
        isKept: draft.isKept,
        needsItem: draft.needsItem,
        isExtra: draft.isExtra,
        notes: draft.notes.trim() ? draft.notes.trim() : null,
        sleeveType: supportsSleeveType(draft.garmentType) ? draft.sleeveType : null
      };
    });

    await updateGarmentsMutation.mutateAsync({
      garments: normalizedGarments
    });

    showSuccess("Prendas por temporada guardadas correctamente.");
  };

  const handleGenerateBaseRequests = async () => {
    const rows = await generateBaseRequestsMutation.mutateAsync();
    showSuccess(`Necesidades base generadas o refrescadas: ${rows.length}.`);
  };

  const handleCreateExtraRequest = async () => {
    if (!selectedSeasonId) {
      showError("Para crear extras, abre la temporada con ?seasonId=...");
      return;
    }

    if (extraRecipientMode === "PERSON" && !selectedPersonNumberId) {
      showError("Selecciona un jugador para crear la necesidad extra.");
      return;
    }
    if (extraRecipientMode === "EXTERNAL" && !extraExternalRecipientName.trim() && !extraExternalRecipientId) {
      showError("Selecciona un destinatario externo o introduce un nombre.");
      return;
    }
    if (extraRecipientMode === "EXTERNAL" && extraChargeMode === "CHARGEABLE") {
      showError("Los extras cobrables requieren una persona del club vinculada.");
      return;
    }

    const quantity = Number(extraQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      showError("La cantidad debe ser un entero mayor que cero.");
      return;
    }

    const unitAmount = Number(extraUnitAmount);
    if (!Number.isFinite(unitAmount) || unitAmount < 0) {
      showError("El importe unitario no es valido.");
      return;
    }

    if (extraChargeMode === "CHARGEABLE" && unitAmount <= 0) {
      showError("Si es cobrable, el importe unitario debe ser mayor que cero.");
      return;
    }

    if (extraRecipientMode === "EXTERNAL" && unitAmount <= 0) {
      showError("Para destinatarios externos, indica el importe en la necesidad.");
      return;
    }

    await createExtraRequestMutation.mutateAsync({
      seasonId: selectedSeasonId,
      personId: extraRecipientMode === "PERSON" ? selectedPersonNumberId : undefined,
      externalRecipientId: extraRecipientMode === "EXTERNAL" && extraExternalRecipientId ? Number(extraExternalRecipientId) : undefined,
      externalRecipientName: extraRecipientMode === "EXTERNAL" ? extraExternalRecipientName.trim() : undefined,
      garmentCategory: extraGarmentCategory,
      sizeCode: extraSizeCode,
      quantity,
      chargeMode: extraChargeMode,
      unitAmount,
      notes: extraNotes.trim() || undefined
    });

    showSuccess("Necesidad extra creada correctamente.");
    setExtraQuantity("1");
    setExtraUnitAmount("0");
    setExtraNotes("");
    if (extraRecipientMode === "EXTERNAL") {
      setExtraExternalRecipientName("");
      setExtraExternalRecipientId("");
    }
  };

  if (loadingBase) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Equipacion">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (errorBase || !activeTeamsQuery.data) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Equipacion">
        <EmptyState
          description="No hemos podido cargar la operativa de equipacion para la temporada seleccionada."
          title="Logistica no disponible"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description="Configura equipacion y genera necesidades por temporada y equipo."
      eyebrow="Logistica por temporada"
      title="Equipacion y necesidades"
    >
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, xl: 4.25 }}>
          <SectionCard
            action={<CheckroomRounded color="primary" />}
            subtitle={`${filteredRows.length} jugadores visibles para equipacion`}
            title="Plantilla"
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Equipo"
                select
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {activeTeamsQuery.data.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {filteredRows.length === 0 ? (
                <EmptyState
                  description="No hay jugadores que cumplan el filtro actual en esta temporada."
                  title="Sin resultados"
                />
              ) : (
                <List disablePadding sx={{ display: "grid", gap: 1 }}>
                  {paginatedRows.map((row) => (
                    <ListItemButton
                      key={row.personId}
                      selected={String(row.personId) === selectedPersonId}
                      onClick={() => setSelectedPersonId(String(row.personId))}
                      sx={{ borderRadius: 3, alignItems: "flex-start" }}
                    >
                      <ListItemText
                        primary={row.fullName}
                        secondary={(
                          <Stack spacing={0.7} sx={{ mt: 0.75 }}>
                            <Typography color="text.secondary" variant="body2">
                              {row.currentTeamName ?? "Sin equipo en la temporada"}
                            </Typography>
                          </Stack>
                        )}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}

              {filteredRows.length > 0 && (
                <Stack sx={{ alignItems: "center" }}>
                  <Pagination count={pageCount} onChange={(_event, value) => setPage(value)} page={page} />
                </Stack>
              )}
            </Stack>
          </SectionCard>
        </Grid2>

        <Grid2 size={{ xs: 12, xl: 7.75 }}>
          {!selectedPersonId ? (
            <EmptyState
              description="Selecciona un jugador de la columna izquierda para configurar su equipacion."
              title="Sin jugador seleccionado"
            />
          ) : !selectedRosterRow ? (
            <EmptyState
              description="El jugador seleccionado ya no esta visible con el filtro actual."
              title="Seleccion no disponible"
            />
          ) : (
            <Stack spacing={3}>
              <SectionCard
                subtitle="Resumen del jugador y del contexto de temporada sobre el que editas las prendas."
                title={selectedRosterRow.fullName}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip label={selectedRosterRow.currentTeamName ?? "Sin equipo"} variant="outlined" />
                    <Chip
                      label={garmentsQuery.data ? `${garmentsQuery.data.length} prendas cargadas` : "Sin datos de prendas"}
                      variant="outlined"
                    />
                  </Stack>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">NIF</Typography>
                      <Typography>{selectedRosterRow.nifValue}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">Temporada</Typography>
                      <Typography>{selectedSeasonId ?? "Actual"}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" variant="body2">Modelo activo</Typography>
                      <Typography>player_season_garments</Typography>
                    </Grid2>
                  </Grid2>
                </Stack>
              </SectionCard>

              <SectionCard
                subtitle="Modelo final por persona y temporada. Permite varias prendas, extras y estados nulos."
                title="Prendas por temporada"
              >
                <Stack spacing={2}>
                  {garmentsError && <Alert severity="error">{garmentsError}</Alert>}

                  {garmentsQuery.isLoading ? (
                    <Stack sx={{ minHeight: 180, alignItems: "center", justifyContent: "center" }}>
                      <CircularProgress size={24} />
                    </Stack>
                  ) : garmentsQuery.isError ? (
                    <EmptyState
                      description="No hemos podido cargar las prendas del nuevo modelo para esta persona."
                      title="Prendas no disponibles"
                    />
                  ) : (
                    <>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ justifyContent: "space-between" }}>
                        <Typography color="text.secondary" variant="body2">
                          {garmentDrafts.length === 0
                            ? "Todavia no hay prendas cargadas para este jugador en la temporada."
                            : `${garmentDrafts.length} prendas editables en el modelo final.`}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button onClick={() => setGarmentDrafts((current) => [...current, createEmptyGarmentDraft()])} variant="outlined">
                            Anadir prenda
                          </Button>
                          <Button onClick={resetGarmentDrafts} variant="outlined">
                            Revertir
                          </Button>
                          <Button disabled={updateGarmentsMutation.isPending} onClick={handleSaveGarments} variant="contained">
                            Guardar prendas
                          </Button>
                        </Stack>
                      </Stack>

                      {garmentDrafts.length === 0 ? (
                        <EmptyState
                          description="Puedes crear aqui la primera prenda del modelo final para esta persona y temporada."
                          title="Sin prendas"
                        />
                      ) : (
                        <Stack sx={{ overflowX: "auto" }}>
                          <Table size="small" sx={{ minWidth: 1120 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Prenda</TableCell>
                                <TableCell>Talla</TableCell>
                                <TableCell>Cant.</TableCell>
                                <TableCell align="center">La tiene</TableCell>
                                <TableCell align="center">Se conserva</TableCell>
                                <TableCell align="center">Se necesita</TableCell>
                                <TableCell align="center">Extra</TableCell>
                                <TableCell>Manga</TableCell>
                                <TableCell>Notas</TableCell>
                                <TableCell align="center">Accion</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {garmentDrafts.map((draft) => (
                                <TableRow key={draft.localId} hover>
                                  <TableCell sx={{ minWidth: 220 }}>
                                    <TextField
                                      fullWidth
                                      select
                                      size="small"
                                      value={draft.garmentType}
                                      onChange={(event) =>
                                        updateGarmentDraft(draft.localId, (current) => ({
                                          ...current,
                                          garmentType: event.target.value as PlayerSeasonGarmentType,
                                          sleeveType: supportsSleeveType(event.target.value as PlayerSeasonGarmentType) ? current.sleeveType : null
                                        }))
                                      }
                                    >
                                      {playerSeasonGarmentTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>
                                    <TextField
                                      fullWidth
                                      select
                                      size="small"
                                      value={draft.size}
                                      onChange={(event) =>
                                        updateGarmentDraft(draft.localId, (current) => ({ ...current, size: event.target.value }))
                                      }
                                    >
                                      <MenuItem value="">Sin informar</MenuItem>
                                      {getSizeOptionsForGarmentType(draft.garmentType, draft.size).map((size) => (
                                        <MenuItem key={size} value={size}>
                                          {size}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 90 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      value={draft.quantity}
                                      onChange={(event) =>
                                        updateGarmentDraft(draft.localId, (current) => ({ ...current, quantity: event.target.value }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: 90 }}>
                                    <Checkbox
                                      checked={draft.hasItem}
                                      onChange={(_event, checked) =>
                                        updateGarmentDraft(draft.localId, (current) => ({ ...current, hasItem: checked }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: 90 }}>
                                    <Checkbox
                                      checked={draft.isKept === true}
                                      indeterminate={draft.isKept === null}
                                      onChange={() =>
                                        updateGarmentDraft(draft.localId, (current) => ({
                                          ...current,
                                          isKept: cycleTriStateValue(current.isKept)
                                        }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: 90 }}>
                                    <Checkbox
                                      checked={draft.needsItem === true}
                                      indeterminate={draft.needsItem === null}
                                      onChange={() =>
                                        updateGarmentDraft(draft.localId, (current) => ({
                                          ...current,
                                          needsItem: cycleTriStateValue(current.needsItem)
                                        }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: 90 }}>
                                    <Checkbox
                                      checked={draft.isExtra}
                                      onChange={(_event, checked) =>
                                        updateGarmentDraft(draft.localId, (current) => ({ ...current, isExtra: checked }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 130 }}>
                                    <TextField
                                      fullWidth
                                      disabled={!supportsSleeveType(draft.garmentType)}
                                      select
                                      size="small"
                                      value={draft.sleeveType ?? ""}
                                      onChange={(event) =>
                                        updateGarmentDraft(draft.localId, (current) => ({
                                          ...current,
                                          sleeveType: (event.target.value || null) as SleeveType | null
                                        }))
                                      }
                                    >
                                      <MenuItem value="">No aplica</MenuItem>
                                      {sleeveTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 260 }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={1}
                                      size="small"
                                      value={draft.notes}
                                      onChange={(event) =>
                                        updateGarmentDraft(draft.localId, (current) => ({ ...current, notes: event.target.value }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: 80 }}>
                                    <IconButton aria-label="Eliminar prenda" onClick={() => removeGarmentDraft(draft.localId)} size="small">
                                      <DeleteOutlineRounded fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Stack>
                      )}

                    </>
                  )}
                </Stack>
              </SectionCard>

            </Stack>
          )}
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <SectionCard
            action={<AddRounded color="primary" />}
            subtitle="Fase 2: genera base y crea extras sin mezclar aqui la operativa de stock"
            title="Necesidades y extras"
          >
            <Stack spacing={2.5}>
              {requestError && <Alert severity="error">{requestError}</Alert>}

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <Button
                  disabled={generateBaseRequestsMutation.isPending}
                  onClick={handleGenerateBaseRequests}
                  variant="contained"
                >
                  Generar necesidades base
                </Button>
                <TextField
                  label="Estado"
                  select
                  size="small"
                  sx={{ minWidth: 220 }}
                  value={requestStatusFilter}
                  onChange={(event) => setRequestStatusFilter(event.target.value as "ALL" | LogisticsRequestStatus)}
                >
                  <MenuItem value="ALL">Todos</MenuItem>
                  {logisticsRequestStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={onlySelectedPersonRequests}
                      onChange={(_event, checked) => setOnlySelectedPersonRequests(checked)}
                    />
                  )}
                  label="Solo jugador seleccionado"
                />
              </Stack>

              <Grid2 container spacing={1.5}>
                <Grid2 size={{ xs: 12, md: 2.2 }}>
                  <TextField
                    fullWidth
                    label="Destino"
                    select
                    size="small"
                    value={extraRecipientMode}
                    onChange={(event) => setExtraRecipientMode(event.target.value as RequestRecipientMode)}
                  >
                    <MenuItem value="PERSON">Jugador seleccionado</MenuItem>
                    <MenuItem value="EXTERNAL">Destinatario externo</MenuItem>
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2.2 }}>
                  <TextField
                    fullWidth
                    label="Prenda"
                    select
                    size="small"
                    value={extraGarmentCategory}
                    onChange={(event) => {
                      const value = event.target.value as LogisticsGarmentCategory;
                      setExtraGarmentCategory(value);
                      setExtraSizeCode(isSocksCategory(value) ? logisticsSocksSizeOptions[0] : logisticsApparelSizeOptions[8]);
                    }}
                  >
                    {logisticsGarmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 1.3 }}>
                  <TextField
                    fullWidth
                    label="Talla"
                    select
                    size="small"
                    value={extraSizeCode}
                    onChange={(event) => setExtraSizeCode(event.target.value)}
                  >
                    {extraSizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 0.9 }}>
                  <TextField
                    fullWidth
                    label="Cant."
                    size="small"
                    type="number"
                    value={extraQuantity}
                    onChange={(event) => setExtraQuantity(event.target.value)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 1.8 }}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    select
                    size="small"
                    value={extraChargeMode}
                    onChange={(event) => setExtraChargeMode(event.target.value as LogisticsChargeMode)}
                  >
                    <MenuItem value="CHARGEABLE">Cobrable</MenuItem>
                    <MenuItem value="CLUB_ASSUMED">Asume club</MenuItem>
                    <MenuItem value="INCLUDED">Incluido</MenuItem>
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 1.4 }}>
                  <TextField
                    fullWidth
                    label="Importe"
                    size="small"
                    type="number"
                    value={extraUnitAmount}
                    onChange={(event) => setExtraUnitAmount(event.target.value)}
                  />
                </Grid2>
                {extraRecipientMode === "EXTERNAL" && (
                  <Grid2 size={{ xs: 12, md: 2.2 }}>
                    <TextField
                      fullWidth
                      label="Destinatario guardado"
                      select
                      size="small"
                      value={extraExternalRecipientId}
                      onChange={(event) => setExtraExternalRecipientId(event.target.value)}
                    >
                      <MenuItem value="">Nuevo / manual</MenuItem>
                      {(externalRecipientsQuery.data ?? []).map((recipient) => (
                        <MenuItem key={recipient.id} value={String(recipient.id)}>
                          {recipient.fullName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                )}
                {extraRecipientMode === "EXTERNAL" && !extraExternalRecipientId && (
                  <Grid2 size={{ xs: 12, md: 2.8 }}>
                    <TextField
                      fullWidth
                      label="Nombre destinatario"
                      size="small"
                      value={extraExternalRecipientName}
                      onChange={(event) => setExtraExternalRecipientName(event.target.value)}
                    />
                  </Grid2>
                )}
                {extraRecipientMode === "EXTERNAL" && (
                  <Grid2 size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button component={Link} to="/logistics/external-recipients" size="small" variant="text">
                        Abrir ficha de destinatarios
                      </Button>
                    </Stack>
                  </Grid2>
                )}
                <Grid2 size={{ xs: 12, md: 12 }}>
                  <TextField
                    fullWidth
                    label="Notas"
                    size="small"
                    value={extraNotes}
                    onChange={(event) => setExtraNotes(event.target.value)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      disabled={createExtraRequestMutation.isPending}
                      onClick={handleCreateExtraRequest}
                      variant="outlined"
                    >
                      Crear extra
                    </Button>
                  </Stack>
                </Grid2>
              </Grid2>

              {requestsQuery.isLoading ? (
                <Stack sx={{ alignItems: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : requestsQuery.data && requestsQuery.data.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Destinatario</TableCell>
                      <TableCell>Prenda</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Cantidades</TableCell>
                      <TableCell>Cargo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requestsQuery.data.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>{request.fullName ?? request.externalRecipientName ?? "--"}</TableCell>
                        <TableCell>{`${getLogisticsGarmentLabel(request.garmentCategory)} · ${request.sizeCode}`}</TableCell>
                        <TableCell>{request.requestType === "BASE" ? "Base" : "Extra"}</TableCell>
                        <TableCell>
                          <Chip
                            color={getLogisticsRequestStatusColor(request.status)}
                            label={getLogisticsRequestStatusLabel(request.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{`${request.quantityReserved}/${request.quantityRequested}`}</TableCell>
                        <TableCell>
                          {request.chargeMode === "CHARGEABLE" ? `${request.totalAmount.toFixed(2)} €` : "No"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  description="No hay necesidades con el filtro actual."
                  title="Sin necesidades"
                />
              )}
            </Stack>
          </SectionCard>
        </Grid2>

      </Grid2>
    </PageContainer>
  );
}
