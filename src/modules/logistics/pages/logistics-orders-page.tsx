import { ChecklistRounded, DeleteOutlineRounded, EditNoteRounded, LocalShippingRounded, SearchRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Grid2,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
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
import { useSearchParams } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { LogisticsRequest, LogisticsStockBalance, LogisticsSupplierOrder } from "../../../shared/types/api";
import { normalizeSearchText } from "../../../shared/utils/normalize-search-text";
import { useActiveTeams } from "../../teams/api/teams-hooks";
import {
  useCreateLogisticsOrderMutation,
  useDeleteLogisticsOrderMutation,
  useLogisticsOrder,
  useLogisticsOrders,
  useLogisticsRequests,
  useReserveLogisticsRequestMutation,
  useLogisticsStock,
  useRegisterLogisticsOrderReceiptMutation,
  useSendLogisticsOrderMutation,
  useUpdateLogisticsOrderMutation
} from "../api/logistics-hooks";
import {
  formatLogisticsCustomization,
  getLogisticsGarmentLabel,
  getLogisticsOrderStatusColor,
  getLogisticsOrderStatusLabel,
  logisticsGarmentOptions
} from "../model/logistics-ui";

type SupplierPreset = "PROTEX" | "DECATHLON" | "OTHER";

const supplierPresetOptions: Array<{ value: SupplierPreset; label: string }> = [
  { value: "PROTEX", label: "Protex" },
  { value: "DECATHLON", label: "Decathlon" },
  { value: "OTHER", label: "Otros" }
];

function getErrorMessage(error: unknown) {
  if (error instanceof HttpClientError) {
    return error.payload?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

function getSupplierPresetFromName(value?: string | null): SupplierPreset {
  if (value === "Protex") {
    return "PROTEX";
  }
  if (value === "Decathlon") {
    return "DECATHLON";
  }
  return "OTHER";
}

function resolveSupplierName(preset: SupplierPreset, otherSupplierName: string) {
  if (preset === "PROTEX") {
    return "Protex";
  }
  if (preset === "DECATHLON") {
    return "Decathlon";
  }
  return otherSupplierName.trim();
}

function getPendingToOrder(request: LogisticsRequest) {
  return Math.max(0, request.quantityRequested - request.quantityReserved - request.quantityDelivered);
}

function hasCustomization(request: LogisticsRequest) {
  return Boolean(formatLogisticsCustomization(request.nameCustomization, request.numberCustomization));
}

function buildStockMatchKey(
  garmentCategory: LogisticsRequest["garmentCategory"],
  sizeCode: string,
  personalized: boolean,
  nameCustomization: string | null | undefined,
  numberCustomization: number | null | undefined
) {
  return [
    garmentCategory,
    sizeCode,
    personalized ? "1" : "0",
    personalized ? (nameCustomization?.trim() ?? "") : "",
    personalized ? String(numberCustomization ?? "") : ""
  ].join("|");
}

function getRequestStockMatchKey(request: LogisticsRequest) {
  const personalized = hasCustomization(request);
  return buildStockMatchKey(
    request.garmentCategory,
    request.sizeCode,
    personalized,
    request.nameCustomization,
    request.numberCustomization
  );
}

function getStockBalanceMatchKey(balance: LogisticsStockBalance) {
  return buildStockMatchKey(
    balance.garmentCategory,
    balance.sizeCode,
    balance.personalized,
    balance.nameCustomization,
    balance.numberCustomization
  );
}

function isPersonalizedRequest(request: LogisticsRequest) {
  return hasCustomization(request);
}

function getRequestRecipientLabel(request: LogisticsRequest) {
  return request.fullName ?? request.externalRecipientName ?? "--";
}

function getRequestChargeLabel(request: LogisticsRequest) {
  if (request.chargeMode === "INCLUDED") {
    return "Incluido";
  }
  if (request.chargeMode === "CLUB_ASSUMED") {
    return "Asume club";
  }
  return formatCurrency(request.totalAmount);
}

function getOrderRequestIds(order: LogisticsSupplierOrder) {
  return Array.from(
    new Set(order.lines.flatMap((line) => line.requestAllocations.map((allocation) => allocation.requestId)))
  );
}

export function LogisticsOrdersPage() {
  const { showError, showSuccess } = useAppFeedback();
  const [searchParams] = useSearchParams();
  const seasonIdParam = searchParams.get("seasonId");
  const selectedSeasonId = seasonIdParam ? Number(seasonIdParam) : undefined;

  const [teamFilter, setTeamFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState<"ALL" | LogisticsRequest["garmentCategory"]>("ALL");
  const [textFilter, setTextFilter] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);

  const [supplierPreset, setSupplierPreset] = useState<SupplierPreset>("PROTEX");
  const [otherSupplierName, setOtherSupplierName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const selectedTeamId = teamFilter === "ALL" ? undefined : Number(teamFilter);
  const activeTeamsQuery = useActiveTeams();
  const requestsQuery = useLogisticsRequests(selectedSeasonId, selectedTeamId);
  const ordersQuery = useLogisticsOrders(selectedSeasonId);
  const stockQuery = useLogisticsStock(selectedSeasonId);
  const selectedOrderQuery = useLogisticsOrder(selectedOrderId);

  const createOrderMutation = useCreateLogisticsOrderMutation();
  const updateOrderMutation = useUpdateLogisticsOrderMutation();
  const deleteOrderMutation = useDeleteLogisticsOrderMutation();
  const sendOrderMutation = useSendLogisticsOrderMutation();
  const receiptMutation = useRegisterLogisticsOrderReceiptMutation();
  const reserveRequestMutation = useReserveLogisticsRequestMutation();

  useEffect(() => {
    const order = selectedOrderQuery.data;
    if (!order) {
      return;
    }

    setSelectedRequestIds(getOrderRequestIds(order));
    setDraftName(order.name ?? "");
    setDraftNotes(order.notes ?? "");

    const preset = getSupplierPresetFromName(order.supplierName);
    setSupplierPreset(preset);
    setOtherSupplierName(preset === "OTHER" ? order.supplierName : "");
  }, [selectedOrderQuery.data]);

  const allPendingRequests = useMemo(() => {
    return (requestsQuery.data ?? [])
      .filter((request) => getPendingToOrder(request) > 0)
      .sort((a, b) => getRequestRecipientLabel(a).localeCompare(getRequestRecipientLabel(b)));
  }, [requestsQuery.data]);

  const filteredRequests = useMemo(() => {
    const normalizedText = normalizeSearchText(textFilter);
    return allPendingRequests.filter((request) => {
      const matchesProduct = productFilter === "ALL" || request.garmentCategory === productFilter;
      if (!matchesProduct) {
        return false;
      }
      if (!normalizedText) {
        return true;
      }

      return (
        normalizeSearchText(request.fullName ?? "").includes(normalizedText) ||
        normalizeSearchText(request.nifValue ?? "").includes(normalizedText)
      );
    });
  }, [allPendingRequests, productFilter, textFilter]);

  const personalizedRequests = useMemo(
    () => filteredRequests.filter((request) => isPersonalizedRequest(request)),
    [filteredRequests]
  );

  const genericRequests = useMemo(
    () => filteredRequests.filter((request) => !isPersonalizedRequest(request)),
    [filteredRequests]
  );

  const stockAvailableByKey = useMemo(() => {
    const balances = stockQuery.data ?? [];
    const totals = new Map<string, number>();

    balances.forEach((balance) => {
      const key = getStockBalanceMatchKey(balance);
      totals.set(key, (totals.get(key) ?? 0) + balance.quantityAvailable);
    });

    return totals;
  }, [stockQuery.data]);

  const stockCoverageByRequestId = useMemo(() => {
    const remainingStockByKey = new Map(stockAvailableByKey);
    const coverage = new Map<number, number>();

    filteredRequests.forEach((request) => {
      const pending = getPendingToOrder(request);
      const stockAvailable = remainingStockByKey.get(getRequestStockMatchKey(request)) ?? 0;
      const covered = Math.min(pending, stockAvailable);
      coverage.set(request.id, covered);
      remainingStockByKey.set(getRequestStockMatchKey(request), stockAvailable - covered);
    });

    return coverage;
  }, [filteredRequests, stockAvailableByKey]);

  const stockCoveredRequests = useMemo(
    () => filteredRequests.filter((request) => (stockCoverageByRequestId.get(request.id) ?? 0) >= getPendingToOrder(request) && getPendingToOrder(request) > 0),
    [filteredRequests, stockCoverageByRequestId]
  );

  const stockPartiallyCoveredRequests = useMemo(
    () =>
      filteredRequests.filter((request) => {
        const covered = stockCoverageByRequestId.get(request.id) ?? 0;
        const pending = getPendingToOrder(request);
        return covered > 0 && covered < pending;
      }),
    [filteredRequests, stockCoverageByRequestId]
  );

  const selectedOrder = selectedOrderQuery.data;
  const isDraftSelected = selectedOrder?.status === "DRAFT";
  const visibleRequestIds = filteredRequests.map((request) => request.id);
  const selectedVisibleCount = visibleRequestIds.filter((requestId) => selectedRequestIds.includes(requestId)).length;
  const allVisibleSelected = visibleRequestIds.length > 0 && selectedVisibleCount === visibleRequestIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && selectedVisibleCount < visibleRequestIds.length;

  const busy =
    createOrderMutation.isPending ||
    updateOrderMutation.isPending ||
    deleteOrderMutation.isPending ||
    sendOrderMutation.isPending ||
    receiptMutation.isPending ||
    reserveRequestMutation.isPending;

  const combinedError =
    getErrorMessage(activeTeamsQuery.error) ??
    getErrorMessage(requestsQuery.error) ??
    getErrorMessage(ordersQuery.error) ??
    getErrorMessage(stockQuery.error) ??
    getErrorMessage(selectedOrderQuery.error) ??
    getErrorMessage(createOrderMutation.error) ??
    getErrorMessage(updateOrderMutation.error) ??
    getErrorMessage(deleteOrderMutation.error) ??
    getErrorMessage(sendOrderMutation.error) ??
    getErrorMessage(receiptMutation.error) ??
    getErrorMessage(reserveRequestMutation.error);

  const handleToggleRequest = (requestId: number) => {
    setSelectedRequestIds((current) =>
      current.includes(requestId) ? current.filter((value) => value !== requestId) : [...current, requestId]
    );
  };

  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedRequestIds((current) => current.filter((requestId) => !visibleRequestIds.includes(requestId)));
      return;
    }

    setSelectedRequestIds((current) => Array.from(new Set([...current, ...visibleRequestIds])));
  };

  const handleClearSelection = () => {
    setSelectedRequestIds([]);
  };

  const handleStartNewDraft = () => {
    setSelectedOrderId(undefined);
    setDraftName("");
    setDraftNotes("");
    setSupplierPreset("PROTEX");
    setOtherSupplierName("");
  };

  const buildDraftPayload = () => {
    const supplierName = resolveSupplierName(supplierPreset, otherSupplierName);
    if (!supplierName) {
      showError("Indica el nombre del proveedor cuando selecciones 'Otros'.");
      return null;
    }

    if (!selectedSeasonId) {
      showError("Abre la pantalla con seasonId en la URL para operar pedidos.");
      return null;
    }

    if (selectedRequestIds.length === 0) {
      showError("Selecciona al menos una necesidad para preparar el pedido.");
      return null;
    }

    return {
      seasonId: selectedSeasonId,
      supplierName,
      name: draftName.trim() || undefined,
      notes: draftNotes.trim() || undefined,
      requestIds: selectedRequestIds
    };
  };

  const handleSaveDraft = async () => {
    const payload = buildDraftPayload();
    if (!payload) {
      return;
    }

    if (isDraftSelected && selectedOrderId) {
      const order = await updateOrderMutation.mutateAsync({
        orderId: selectedOrderId,
        payload: {
          supplierName: payload.supplierName,
          name: payload.name,
          notes: payload.notes,
          requestIds: payload.requestIds
        }
      });
      setSelectedOrderId(order.id);
      showSuccess("Borrador actualizado.");
      return;
    }

    const order = await createOrderMutation.mutateAsync(payload);
    setSelectedOrderId(order.id);
    showSuccess("Borrador creado.");
  };

  const handleDeleteDraft = async () => {
    if (!isDraftSelected || !selectedOrderId) {
      return;
    }

    if (!window.confirm("Se borrara el pedido en borrador de forma definitiva. Continuar?")) {
      return;
    }

    await deleteOrderMutation.mutateAsync(selectedOrderId);
    setSelectedOrderId(undefined);
    showSuccess("Borrador eliminado.");
  };

  const handleSendOrder = async () => {
    if (!isDraftSelected || !selectedOrderId) {
      return;
    }

    const order = await sendOrderMutation.mutateAsync(selectedOrderId);
    setSelectedOrderId(order.id);
    showSuccess("Pedido enviado.");
  };

  const handleRegisterReceipt = async () => {
    if (!selectedOrderId) {
      return;
    }

    const order = await receiptMutation.mutateAsync({ orderId: selectedOrderId });
    setSelectedOrderId(order.id);
    showSuccess("Recepcion registrada.");
  };

  const handleCoverFromStock = async (request: LogisticsRequest) => {
    const coverableQuantity = stockCoverageByRequestId.get(request.id) ?? 0;
    if (coverableQuantity <= 0) {
      return;
    }

    await reserveRequestMutation.mutateAsync({
      requestId: request.id,
      payload: { quantity: coverableQuantity }
    });
    setSelectedRequestIds((current) => current.filter((requestId) => requestId !== request.id));
    showSuccess("Necesidad cubierta desde excedente y enviada a entregas.");
  };

  const renderRequestsTable = (title: string, subtitle: string, rows: LogisticsRequest[]) => (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Stack spacing={0.25}>
          <Typography variant="h6">{title}</Typography>
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        </Stack>
        <Chip label={`${rows.length} necesidades`} size="small" variant="outlined" />
      </Stack>

      {rows.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          No hay resultados en este bloque con los filtros actuales.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={rows.length > 0 && rows.every((request) => selectedRequestIds.includes(request.id))}
                  indeterminate={rows.some((request) => selectedRequestIds.includes(request.id)) && !rows.every((request) => selectedRequestIds.includes(request.id))}
                  onChange={() => {
                    const rowIds = rows.map((request) => request.id);
                    const allSelected = rowIds.every((requestId) => selectedRequestIds.includes(requestId));
                    if (allSelected) {
                      setSelectedRequestIds((current) => current.filter((requestId) => !rowIds.includes(requestId)));
                    } else {
                      setSelectedRequestIds((current) => Array.from(new Set([...current, ...rowIds])));
                    }
                  }}
                />
              </TableCell>
              <TableCell>Destinatario</TableCell>
              <TableCell>Prenda</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>Personalizacion</TableCell>
              <TableCell>Pendiente</TableCell>
              <TableCell>Stock compatible</TableCell>
              <TableCell>A pedir</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="right">Accion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((request) => (
              <TableRow key={request.id} hover selected={selectedRequestIds.includes(request.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRequestIds.includes(request.id)}
                    onChange={() => handleToggleRequest(request.id)}
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.35}>
                    <Typography variant="body2">{getRequestRecipientLabel(request)}</Typography>
                    <Typography color="text.secondary" variant="caption">
                      {request.nifValue ?? request.originTeamName ?? "Sin NIF"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{getLogisticsGarmentLabel(request.garmentCategory)}</TableCell>
                <TableCell>{request.sizeCode}</TableCell>
                <TableCell>{formatLogisticsCustomization(request.nameCustomization, request.numberCustomization) ?? "--"}</TableCell>
                <TableCell>{getPendingToOrder(request)}</TableCell>
                <TableCell>{stockCoverageByRequestId.get(request.id) ?? 0}</TableCell>
                <TableCell>
                  {Math.max(0, getPendingToOrder(request) - (stockCoverageByRequestId.get(request.id) ?? 0))}
                </TableCell>
                <TableCell>{getRequestChargeLabel(request)}</TableCell>
                <TableCell align="right">
                  {(stockCoverageByRequestId.get(request.id) ?? 0) > 0 ? (
                    <Button
                      disabled={reserveRequestMutation.isPending}
                      onClick={() => void handleCoverFromStock(request)}
                      size="small"
                      variant="outlined"
                    >
                      Cubrir desde excedente
                    </Button>
                  ) : (
                    <Typography color="text.secondary" variant="caption">
                      Sin excedente
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );

  if (!selectedSeasonId) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Pedidos">
        <EmptyState
          title="Selecciona temporada"
          description="Abre la vista con seasonId en la URL para preparar pedidos."
        />
      </PageContainer>
    );
  }

  if (activeTeamsQuery.isLoading || requestsQuery.isLoading || ordersQuery.isLoading || stockQuery.isLoading) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Pedidos">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      eyebrow="Logistica por temporada"
      title="Pedidos"
      description="Revisa excedente, selecciona necesidades pendientes, prepara un borrador editable y luego envia o recibe el pedido sin mezclar la operativa."
      actions={(
        <Button onClick={handleStartNewDraft} variant="outlined">
          Preparar nuevo borrador
        </Button>
      )}
    >
      <Stack spacing={3}>
        {combinedError && <Alert severity="error">{combinedError}</Alert>}

        <SectionCard
          action={<ChecklistRounded color="primary" />}
          title="Flujo de trabajo"
          subtitle="1. Cubre desde excedente lo que ya tienes. 2. Filtra y selecciona necesidades. 3. Guarda el borrador. 4. Envia el pedido."
        >
          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, md: 2.3 }}>
              <TextField
                fullWidth
                label="Equipo"
                select
                size="small"
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {(activeTeamsQuery.data ?? []).map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2.7 }}>
              <TextField
                fullWidth
                label="Producto"
                select
                size="small"
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value as "ALL" | LogisticsRequest["garmentCategory"])}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {logisticsGarmentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Buscar por nombre o NIF"
                size="small"
                value={textFilter}
                onChange={(event) => setTextFilter(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ height: "100%", alignItems: "center", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                <Checkbox checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={handleToggleAllVisible} />
                <Typography variant="body2">Seleccionar visibles</Typography>
                <Button onClick={handleClearSelection} size="small">
                  Vaciar
                </Button>
              </Stack>
            </Grid2>
          </Grid2>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={`${filteredRequests.length} necesidades visibles`} size="small" />
            <Chip label={`${selectedRequestIds.length} seleccionadas`} size="small" variant="outlined" />
            <Chip label={`${personalizedRequests.length} personalizadas`} size="small" variant="outlined" />
            <Chip label={`${genericRequests.length} genericas`} size="small" variant="outlined" />
          </Stack>
        </SectionCard>

        <SectionCard
          action={<ChecklistRounded color="primary" />}
          title="Revisión de excedente"
          subtitle="Comprueba si alguna necesidad ya tiene stock compatible antes de incluirla en el pedido o cubrirla directamente."
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`${stockQuery.data?.length ?? 0} saldos de stock`} size="small" variant="outlined" />
              <Chip label={`${stockCoveredRequests.length} cubiertas`} size="small" color="success" variant="outlined" />
              <Chip label={`${stockPartiallyCoveredRequests.length} parciales`} size="small" color="warning" variant="outlined" />
              <Chip label={`${filteredRequests.length - stockCoveredRequests.length - stockPartiallyCoveredRequests.length} sin stock`} size="small" variant="outlined" />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Si una necesidad aparece cubierta, no hace falta pedirla ahora; si está parcial, revisa cuánto excedente queda antes de guardar el borrador.
            </Typography>
          </Stack>
        </SectionCard>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12 }}>
            <SectionCard
              action={<EditNoteRounded color="primary" />}
              title="Necesidades pendientes para pedir"
              subtitle="Las camisetas personalizadas se separan para que no se mezclen con el stock generico."
            >
              <Stack spacing={3}>
                {filteredRequests.length === 0 ? (
                  <EmptyState
                    title="Sin necesidades pendientes"
                    description="No hay nada por pedir con los filtros actuales."
                  />
                ) : (
                  <>
                    {renderRequestsTable(
                      "Personalizadas",
                      "Principalmente camisetas de partido con nombre y dorsal.",
                      personalizedRequests
                    )}
                    {renderRequestsTable(
                      "Genericas",
                      "Prendas agrupables por producto y talla.",
                      genericRequests
                    )}
                  </>
                )}
              </Stack>
            </SectionCard>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, xl: 5 }}>
            <SectionCard
              action={<LocalShippingRounded color="primary" />}
              title={isDraftSelected ? "Borrador editable" : selectedOrder ? "Pedido seleccionado" : "Nuevo borrador"}
              subtitle={
                isDraftSelected
                  ? "Puedes cambiar proveedor, nombre y las necesidades incluidas antes de enviarlo."
                  : selectedOrder
                    ? "Pedido en seguimiento. La fecha se gestiona segun su estado."
                    : "Prepara aqui la cabecera del pedido y guarda el borrador."
              }
            >
              <Stack spacing={2}>
                {selectedOrder && (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      color={getLogisticsOrderStatusColor(selectedOrder.status)}
                      label={getLogisticsOrderStatusLabel(selectedOrder.status)}
                      size="small"
                    />
                    <Chip label={`${selectedOrder.totalQuantityOrdered} uds.`} size="small" variant="outlined" />
                    <Chip label={`${selectedOrder.totalQuantityPending} pendientes`} size="small" variant="outlined" />
                  </Stack>
                )}

                <TextField
                  fullWidth
                  label="Proveedor"
                  select
                  size="small"
                  disabled={Boolean(selectedOrder) && !isDraftSelected}
                  value={supplierPreset}
                  onChange={(event) => setSupplierPreset(event.target.value as SupplierPreset)}
                >
                  {supplierPresetOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                {supplierPreset === "OTHER" && (
                  <TextField
                    fullWidth
                    label="Nombre proveedor"
                    size="small"
                    disabled={Boolean(selectedOrder) && !isDraftSelected}
                    value={otherSupplierName}
                    onChange={(event) => setOtherSupplierName(event.target.value)}
                  />
                )}

                <TextField
                  fullWidth
                  label="Nombre del pedido"
                  size="small"
                  disabled={Boolean(selectedOrder) && !isDraftSelected}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />

                <TextField
                  fullWidth
                  label="Notas"
                  size="small"
                  multiline
                  minRows={2}
                  disabled={Boolean(selectedOrder) && !isDraftSelected}
                  value={draftNotes}
                  onChange={(event) => setDraftNotes(event.target.value)}
                />

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "nowrap" }}>
                  <Button disabled={busy} onClick={() => void handleSaveDraft()} variant="contained">
                    {isDraftSelected ? "Guardar borrador" : "Crear borrador"}
                  </Button>
                  <Button
                    disabled={busy || !isDraftSelected}
                    onClick={() => void handleSendOrder()}
                    variant="outlined"
                  >
                    Enviar pedido
                  </Button>
                  <Button
                    disabled={busy || !selectedOrder || selectedOrder.totalQuantityPending <= 0 || selectedOrder.status === "DRAFT"}
                    onClick={() => void handleRegisterReceipt()}
                    variant="outlined"
                  >
                    Registrar recepcion
                  </Button>
                  <Tooltip title="Borrar borrador">
                    <span>
                      <IconButton
                        color="error"
                        disabled={busy || !isDraftSelected}
                        onClick={() => void handleDeleteDraft()}
                        size="small"
                      >
                        <DeleteOutlineRounded />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 7 }}>
            <SectionCard
              title="Detalle del pedido"
              subtitle={selectedOrder ? "Lineas y destinatarios incluidos en el pedido seleccionado." : "Selecciona un pedido o crea uno nuevo para ver el detalle."}
            >
              {!selectedOrder ? (
                <Typography color="text.secondary" variant="body2">
                  Aun no hay un pedido seleccionado.
                </Typography>
              ) : selectedOrderQuery.isLoading ? (
                <Stack sx={{ alignItems: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Prenda</TableCell>
                      <TableCell>Pers.</TableCell>
                      <TableCell>Pedido</TableCell>
                      <TableCell>Recibido</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Stack spacing={0.35}>
                            <Typography variant="body2">{getLogisticsGarmentLabel(line.garmentCategory)}</Typography>
                            <Typography color="text.secondary" variant="caption">
                              {line.sizeCode}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{formatLogisticsCustomization(line.nameCustomization, line.numberCustomization) ?? "--"}</TableCell>
                        <TableCell>{line.quantityOrdered}</TableCell>
                        <TableCell>{line.quantityReceived}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </Grid2>
        </Grid2>

        <SectionCard
          action={<ChecklistRounded color="primary" />}
          title="Pedidos ya creados"
          subtitle="Abre uno para editarlo si sigue en borrador o para registrar la recepcion si ya fue enviado."
        >
          {(ordersQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="Todavia no hay pedidos"
              description="Cuando guardes el primer borrador, aparecera aqui."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Uds.</TableCell>
                  <TableCell>Pendiente</TableCell>
                  <TableCell align="right">Accion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(ordersQuery.data ?? []).map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    selected={selectedOrderId === order.id}
                  >
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell>
                      <Chip
                        color={getLogisticsOrderStatusColor(order.status)}
                        label={getLogisticsOrderStatusLabel(order.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{order.totalQuantityOrdered}</TableCell>
                    <TableCell>{order.totalQuantityPending}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => setSelectedOrderId(order.id)} size="small" variant="outlined">
                        {selectedOrderId === order.id ? "Abierto" : "Abrir"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
