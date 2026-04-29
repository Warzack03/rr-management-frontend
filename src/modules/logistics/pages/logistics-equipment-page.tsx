import { zodResolver } from "@hookform/resolvers/zod";
import { AddRounded, CheckroomRounded, SearchRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid2,
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
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type {
  LogisticsChargeMode,
  LogisticsGarmentCategory,
  LogisticsKitMode,
  LogisticsRequestStatus
} from "../../../shared/types/api";
import { normalizeSearchText } from "../../../shared/utils/normalize-search-text";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import {
  useCreateLogisticsRequestMutation,
  useGenerateBaseRequestsMutation,
  useLogisticsExternalRecipients,
  useLogisticsEquipment,
  useLogisticsEquipmentDetail,
  useLogisticsRequests,
  useUpdateLogisticsEquipmentMutation
} from "../api/logistics-hooks";
import {
  getLogisticsGarmentLabel,
  getLogisticsKitModeLabel,
  getLogisticsRequestStatusColor,
  getLogisticsRequestStatusLabel,
  getLogisticsStatusColor,
  getLogisticsStatusLabel,
  logisticsApparelSizeOptions,
  logisticsGarmentOptions,
  logisticsKitModeOptions,
  logisticsRequestStatusOptions,
  logisticsSocksSizeOptions
} from "../model/logistics-ui";

const PAGE_SIZE = 10;

const equipmentFormSchema = z.object({
  kitMode: z.enum(["PLAYER", "GOALKEEPER"]).nullable(),
  shirtName: z.string().optional(),
  shirtNumber: z.union([z.coerce.number().int().positive("Debe ser positivo"), z.null()]),
  shirtSize: z.string().nullable(),
  pantsSize: z.string().nullable(),
  jacketSize: z.string().nullable(),
  socksSize: z.string().nullable(),
  notes: z.string().optional()
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

type RequestRecipientMode = "PERSON" | "EXTERNAL";

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

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      kitMode: null,
      shirtName: "",
      shirtNumber: null,
      shirtSize: null,
      pantsSize: null,
      jacketSize: null,
      socksSize: null,
      notes: ""
    }
  });

  const activeTeamsQuery = useActiveTeams();
  const externalRecipientsQuery = useLogisticsExternalRecipients();
  const selectedTeamId = teamFilter === "ALL" ? undefined : Number(teamFilter);
  const selectedPersonNumberId = selectedPersonId ? Number(selectedPersonId) : undefined;
  const equipmentQuery = useLogisticsEquipment(selectedSeasonId, selectedTeamId);
  const filteredRows = useMemo(() => {
    const rows = equipmentQuery.data ?? [];
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
  }, [equipmentQuery.data, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRows, page]);

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

  const detailQuery = useLogisticsEquipmentDetail(selectedPersonId, selectedSeasonId);
  const updateMutation = useUpdateLogisticsEquipmentMutation(selectedPersonId, selectedSeasonId);
  const requestsQuery = useLogisticsRequests(
    selectedSeasonId,
    selectedTeamId,
    onlySelectedPersonRequests ? selectedPersonNumberId : undefined,
    requestStatusFilter === "ALL" ? undefined : requestStatusFilter
  );
  const generateBaseRequestsMutation = useGenerateBaseRequestsMutation(selectedSeasonId, selectedTeamId);
  const createExtraRequestMutation = useCreateLogisticsRequestMutation();

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    form.reset({
      kitMode: detailQuery.data.kitMode,
      shirtName: detailQuery.data.shirtName ?? "",
      shirtNumber: detailQuery.data.shirtNumber,
      shirtSize: detailQuery.data.shirtSize,
      pantsSize: detailQuery.data.pantsSize,
      jacketSize: detailQuery.data.jacketSize,
      socksSize: detailQuery.data.socksSize,
      notes: detailQuery.data.notes ?? ""
    });
  }, [detailQuery.data, form]);

  const loadingBase = activeTeamsQuery.isLoading || equipmentQuery.isLoading;
  const errorBase = activeTeamsQuery.isError || equipmentQuery.isError;
  const updateError = getErrorMessage(updateMutation.error);
  const requestError = getErrorMessage(requestsQuery.error) ?? getErrorMessage(createExtraRequestMutation.error);
  const extraSizeOptions = isSocksCategory(extraGarmentCategory) ? logisticsSocksSizeOptions : logisticsApparelSizeOptions;

  const resetEquipmentForm = () => {
    if (!detailQuery.data) {
      return;
    }
    form.reset({
      kitMode: detailQuery.data.kitMode,
      shirtName: detailQuery.data.shirtName ?? "",
      shirtNumber: detailQuery.data.shirtNumber,
      shirtSize: detailQuery.data.shirtSize,
      pantsSize: detailQuery.data.pantsSize,
      jacketSize: detailQuery.data.jacketSize,
      socksSize: detailQuery.data.socksSize,
      notes: detailQuery.data.notes ?? ""
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!selectedPersonId) {
      return;
    }

    await updateMutation.mutateAsync({
      kitMode: values.kitMode,
      shirtName: values.shirtName?.trim() ? values.shirtName.trim() : null,
      shirtNumber: values.shirtNumber,
      shirtSize: values.shirtSize,
      pantsSize: values.pantsSize,
      jacketSize: values.jacketSize,
      socksSize: values.socksSize,
      notes: values.notes?.trim() ? values.notes.trim() : null
    });

    showSuccess("Perfil de equipacion guardado correctamente.");
  });

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

  if (errorBase || !equipmentQuery.data || !activeTeamsQuery.data) {
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
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                              <Chip color={getLogisticsStatusColor(row.status)} label={getLogisticsStatusLabel(row.status)} size="small" />
                              {row.kitMode && <Chip label={getLogisticsKitModeLabel(row.kitMode)} size="small" variant="outlined" />}
                            </Stack>
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
          ) : detailQuery.isLoading ? (
            <SectionCard subtitle="Cargando la ficha textil del jugador seleccionado" title="Perfil de equipacion">
              <Stack sx={{ minHeight: 240, alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
              </Stack>
            </SectionCard>
          ) : detailQuery.isError || !detailQuery.data ? (
            <EmptyState
              description="No hemos podido cargar la ficha de equipacion para este jugador."
              title="Ficha no disponible"
            />
          ) : (
            <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
              {updateError && <Alert severity="error">{updateError}</Alert>}

              <SectionCard
                subtitle="Resumen actual del perfil textil en la temporada seleccionada"
                title={detailQuery.data.fullName}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip color={getLogisticsStatusColor(detailQuery.data.status)} label={getLogisticsStatusLabel(detailQuery.data.status)} />
                    <Chip label={detailQuery.data.currentTeamName ?? "Sin equipo"} variant="outlined" />
                    <Chip label={`Origen: ${detailQuery.data.originTeamName ?? "Sin origen"}`} variant="outlined" />
                    <Chip label={getLogisticsKitModeLabel(detailQuery.data.kitMode)} variant="outlined" />
                  </Stack>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography color="text.secondary" variant="body2">Nombre camiseta</Typography>
                      <Typography>{detailQuery.data.shirtName ?? "--"}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography color="text.secondary" variant="body2">Dorsal</Typography>
                      <Typography>{detailQuery.data.shirtNumber ?? "--"}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography color="text.secondary" variant="body2">Talla camisetas</Typography>
                      <Typography>{detailQuery.data.shirtSize ?? "--"}</Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography color="text.secondary" variant="body2">Talla medias</Typography>
                      <Typography>{detailQuery.data.socksSize ?? "--"}</Typography>
                    </Grid2>
                  </Grid2>
                </Stack>
              </SectionCard>

              <SectionCard subtitle="Completa o ajusta tallas, nombre y dorsal sin salir de la mesa de trabajo" title="Editar equipacion">
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Modo"
                      select
                      value={form.watch("kitMode") ?? ""}
                      onChange={(event) =>
                        form.setValue("kitMode", (event.target.value || null) as LogisticsKitMode | null, { shouldDirty: true })
                      }
                    >
                      <MenuItem value="">Sin definir</MenuItem>
                      {logisticsKitModeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Nombre camiseta" {...form.register("shirtName")} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 4 }}>
                    <TextField
                      error={!!form.formState.errors.shirtNumber}
                      fullWidth
                      helperText={form.formState.errors.shirtNumber?.message}
                      label="Dorsal"
                      type="number"
                      value={form.watch("shirtNumber") ?? ""}
                      onChange={(event) =>
                        form.setValue("shirtNumber", event.target.value === "" ? null : Number(event.target.value), {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                      }
                    />
                  </Grid2>

                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Talla camisetas"
                      select
                      value={form.watch("shirtSize") ?? ""}
                      onChange={(event) => form.setValue("shirtSize", event.target.value || null, { shouldDirty: true })}
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {logisticsApparelSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Talla pantalones"
                      select
                      value={form.watch("pantsSize") ?? ""}
                      onChange={(event) => form.setValue("pantsSize", event.target.value || null, { shouldDirty: true })}
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {logisticsApparelSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Talla chaquetas"
                      select
                      value={form.watch("jacketSize") ?? ""}
                      onChange={(event) => form.setValue("jacketSize", event.target.value || null, { shouldDirty: true })}
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {logisticsApparelSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Talla medias"
                      select
                      value={form.watch("socksSize") ?? ""}
                      onChange={(event) => form.setValue("socksSize", event.target.value || null, { shouldDirty: true })}
                    >
                      <MenuItem value="">Sin informar</MenuItem>
                      {logisticsSocksSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Notas"
                      minRows={4}
                      multiline
                      {...form.register("notes")}
                    />
                  </Grid2>
                </Grid2>

                <Divider />

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                  <Button onClick={resetEquipmentForm} variant="outlined">
                    Revertir cambios
                  </Button>
                  <Button disabled={updateMutation.isPending} type="submit" variant="contained">
                    Guardar perfil de equipacion
                  </Button>
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
