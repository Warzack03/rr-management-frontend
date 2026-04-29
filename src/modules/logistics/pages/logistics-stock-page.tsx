import { AddRounded, Inventory2Rounded, RemoveRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { LogisticsGarmentCategory, LogisticsStockBalance } from "../../../shared/types/api";
import {
  useLogisticsStock,
  useLogisticsStockMovements,
  useLogisticsStockSurplusReviews,
  useManualLogisticsStockAdjustmentMutation,
  useManualLogisticsStockEntryMutation,
  useSendLogisticsStockSurplusToStockMutation
} from "../api/logistics-hooks";
import {
  formatLogisticsCustomization,
  getLogisticsGarmentLabel,
  getLogisticsMovementLabel,
  logisticsApparelSizeOptions,
  logisticsGarmentOptions,
  logisticsSocksSizeOptions
} from "../model/logistics-ui";

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

function buildCustomizationSortValue(balance: LogisticsStockBalance) {
  return formatLogisticsCustomization(balance.nameCustomization, balance.numberCustomization) ?? "";
}

function shouldShowBalance(balance: LogisticsStockBalance) {
  return balance.quantityAvailable > 0 || balance.quantityReserved > 0;
}

export function LogisticsStockPage() {
  const { showError, showSuccess } = useAppFeedback();
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const selectedSeasonId = seasonId ? Number(seasonId) : undefined;

  const [stockCategoryFilter, setStockCategoryFilter] = useState<"ALL" | LogisticsGarmentCategory>("ALL");
  const [stockSizeFilter, setStockSizeFilter] = useState("");
  const [stockEntryCategory, setStockEntryCategory] = useState<LogisticsGarmentCategory>("MATCH_SHIRT");
  const [stockEntrySizeCode, setStockEntrySizeCode] = useState<string>("M");
  const [stockEntryQuantity, setStockEntryQuantity] = useState<string>("1");
  const [stockEntryLocation, setStockEntryLocation] = useState("");
  const [stockEntryNotes, setStockEntryNotes] = useState("");

  const stockQuery = useLogisticsStock(
    selectedSeasonId,
    stockCategoryFilter === "ALL" ? undefined : stockCategoryFilter,
    stockSizeFilter || undefined
  );
  const stockMovementsQuery = useLogisticsStockMovements(selectedSeasonId);
  const surplusReviewsQuery = useLogisticsStockSurplusReviews(selectedSeasonId);
  const stockEntryMutation = useManualLogisticsStockEntryMutation();
  const stockAdjustmentMutation = useManualLogisticsStockAdjustmentMutation();
  const sendSurplusMutation = useSendLogisticsStockSurplusToStockMutation();

  const stockEntrySizeOptions = isSocksCategory(stockEntryCategory) ? logisticsSocksSizeOptions : logisticsApparelSizeOptions;
  const stockSizeFilterOptions = useMemo(() => {
    if (stockCategoryFilter === "MATCH_SOCKS") {
      return [...logisticsSocksSizeOptions];
    }
    if (stockCategoryFilter === "ALL") {
      return [...logisticsApparelSizeOptions, ...logisticsSocksSizeOptions];
    }
    return [...logisticsApparelSizeOptions];
  }, [stockCategoryFilter]);

  const visibleBalances = useMemo(() => (stockQuery.data ?? []).filter(shouldShowBalance), [stockQuery.data]);

  const stockSummary = useMemo(() => {
    return visibleBalances.reduce(
      (summary, balance) => {
        summary.rows += 1;
        summary.available += balance.quantityAvailable;
        summary.reserved += balance.quantityReserved;
        summary.personalized += balance.personalized ? 1 : 0;
        return summary;
      },
      { rows: 0, available: 0, reserved: 0, personalized: 0 }
    );
  }, [visibleBalances]);

  const groupedBalances = useMemo(() => {
    const balances = visibleBalances;
    return logisticsGarmentOptions
      .map((option) => {
        const garmentBalances = balances
          .filter((balance) => balance.garmentCategory === option.value)
          .sort((a, b) => {
            const sizeCompare = a.sizeCode.localeCompare(b.sizeCode);
            if (sizeCompare !== 0) {
              return sizeCompare;
            }
            return buildCustomizationSortValue(a).localeCompare(buildCustomizationSortValue(b));
          });

        return {
          garmentCategory: option.value,
          garmentLabel: option.label,
          generic: garmentBalances.filter((balance) => !balance.personalized),
          personalized: garmentBalances.filter((balance) => balance.personalized),
          available: garmentBalances.reduce((total, balance) => total + balance.quantityAvailable, 0),
          reserved: garmentBalances.reduce((total, balance) => total + balance.quantityReserved, 0)
        };
      })
      .filter((group) => group.generic.length > 0 || group.personalized.length > 0);
  }, [visibleBalances]);

  const stockError =
    getErrorMessage(stockQuery.error) ??
    getErrorMessage(stockMovementsQuery.error) ??
    getErrorMessage(surplusReviewsQuery.error) ??
    getErrorMessage(stockEntryMutation.error) ??
    getErrorMessage(stockAdjustmentMutation.error) ??
    getErrorMessage(sendSurplusMutation.error);

  const handleManualStockEntry = async () => {
    if (!selectedSeasonId) {
      showError("Para cargar stock, abre la temporada con ?seasonId=...");
      return;
    }

    const quantity = Number(stockEntryQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      showError("La cantidad de entrada debe ser un entero mayor que cero.");
      return;
    }

    await stockEntryMutation.mutateAsync({
      seasonId: selectedSeasonId,
      garmentCategory: stockEntryCategory,
      sizeCode: stockEntrySizeCode,
      quantity,
      location: stockEntryLocation.trim() || undefined,
      notes: stockEntryNotes.trim() || undefined
    });

    showSuccess("Entrada de stock registrada.");
    setStockEntryQuantity("1");
    setStockEntryNotes("");
  };

  const handleQuickAdjustment = async (stockBalanceId: number, delta: number) => {
    await stockAdjustmentMutation.mutateAsync({
      stockBalanceId,
      delta,
      notes: "Ajuste rapido desde la mesa de stock"
    });
    showSuccess("Ajuste de stock aplicado.");
  };

  const handleSendToStock = async (reviewId: number) => {
    await sendSurplusMutation.mutateAsync(reviewId);
    showSuccess("Sobrante mandado a stock.");
  };

  if (stockQuery.isLoading) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Stock excedente">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description="Controla el excedente fisico del club, su ubicacion y los movimientos manuales."
      eyebrow="Logistica por temporada"
      title="Stock excedente"
    >
      <SectionCard action={<Inventory2Rounded color="primary" />} subtitle="Alta y ajuste manual con trazabilidad" title="Stock y movimientos">
        <Stack spacing={2.5}>
          {stockError && <Alert severity="error">{stockError}</Alert>}

          <Stack spacing={2}>
            <Stack spacing={1.5} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2">Filtros del listado</Typography>
              <Grid2 container spacing={1.5}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Prenda"
                    select
                    size="small"
                    value={stockCategoryFilter}
                    onChange={(event) => {
                      const value = event.target.value as "ALL" | LogisticsGarmentCategory;
                      setStockCategoryFilter(value);
                      setStockSizeFilter("");
                    }}
                  >
                    <MenuItem value="ALL">Todas</MenuItem>
                    {logisticsGarmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    label="Talla"
                    select
                    size="small"
                    value={stockSizeFilter}
                    onChange={(event) => setStockSizeFilter(event.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {stockSizeFilterOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
              </Grid2>
            </Stack>

            <Stack spacing={1.5} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}>
              <Typography variant="subtitle2">Entrada manual</Typography>
              <Grid2 container spacing={1.5}>
                <Grid2 size={{ xs: 12, md: 2.8 }}>
                  <TextField
                    fullWidth
                    label="Prenda"
                    select
                    size="small"
                    value={stockEntryCategory}
                    onChange={(event) => {
                      const value = event.target.value as LogisticsGarmentCategory;
                      setStockEntryCategory(value);
                      setStockEntrySizeCode(isSocksCategory(value) ? logisticsSocksSizeOptions[0] : logisticsApparelSizeOptions[8]);
                    }}
                  >
                    {logisticsGarmentOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Talla"
                    select
                    size="small"
                    value={stockEntrySizeCode}
                    onChange={(event) => setStockEntrySizeCode(event.target.value)}
                  >
                    {stockEntrySizeOptions.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 1 }}>
                  <TextField
                    fullWidth
                    label="Cant."
                    size="small"
                    type="number"
                    value={stockEntryQuantity}
                    onChange={(event) => setStockEntryQuantity(event.target.value)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2.4 }}>
                  <TextField
                    fullWidth
                    label="Ubicacion"
                    size="small"
                    value={stockEntryLocation}
                    onChange={(event) => setStockEntryLocation(event.target.value)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2.3 }}>
                  <TextField
                    fullWidth
                    label="Nota"
                    size="small"
                    value={stockEntryNotes}
                    onChange={(event) => setStockEntryNotes(event.target.value)}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 2 }}>
                  <Button
                    disabled={stockEntryMutation.isPending}
                    fullWidth
                    onClick={handleManualStockEntry}
                    sx={{ height: "100%" }}
                    variant="contained"
                  >
                    Entrada manual
                  </Button>
                </Grid2>
              </Grid2>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={`${stockSummary.rows} lineas activas`} size="small" />
            <Chip color="success" label={`${stockSummary.available} disponibles`} size="small" variant="outlined" />
            <Chip color="warning" label={`${stockSummary.reserved} reservadas`} size="small" variant="outlined" />
            <Chip label={`${stockSummary.personalized} personalizadas`} size="small" variant="outlined" />
          </Stack>

          {groupedBalances.length > 0 ? (
            <Stack spacing={2}>
              {groupedBalances.map((group) => (
                <Stack key={group.garmentCategory} spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <Typography variant="subtitle2">{group.garmentLabel}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip label={`${group.generic.length} genericas`} size="small" variant="outlined" />
                      <Chip label={`${group.personalized.length} personalizadas`} size="small" variant="outlined" />
                      <Chip color="success" label={`${group.available} disp.`} size="small" variant="outlined" />
                      <Chip color="warning" label={`${group.reserved} res.`} size="small" variant="outlined" />
                    </Stack>
                  </Stack>

                  {group.generic.length > 0 && (
                    <Stack spacing={1}>
                      <Typography color="text.secondary" variant="caption">
                        Tallas agrupadas
                      </Typography>
                      {group.generic.map((balance) => (
                        <Stack
                          key={balance.id}
                          direction={{ xs: "column", md: "row" }}
                          spacing={1.5}
                          sx={{
                            alignItems: { md: "center" },
                            justifyContent: "space-between",
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 2.5,
                            px: 1.5,
                            py: 1.25,
                            bgcolor: "background.paper"
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700} variant="body2">
                              Talla {balance.sizeCode}
                            </Typography>
                            <Typography color="text.secondary" variant="caption">
                              {balance.location?.trim() ? balance.location : "Sin ubicacion"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            <Chip color="success" label={`Disp. ${balance.quantityAvailable}`} size="small" />
                            <Chip color="warning" label={`Res. ${balance.quantityReserved}`} size="small" variant="outlined" />
                            {balance.quantityDelivered > 0 && (
                              <Chip label={`Ent. ${balance.quantityDelivered}`} size="small" variant="outlined" />
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                              disabled={stockAdjustmentMutation.isPending || balance.quantityAvailable <= 0}
                              onClick={() => handleQuickAdjustment(balance.id, -1)}
                              size="small"
                              aria-label="Quitar una unidad"
                              variant="outlined"
                            >
                              <RemoveRounded fontSize="small" />
                            </Button>
                            <Button
                              disabled={stockAdjustmentMutation.isPending}
                              onClick={() => handleQuickAdjustment(balance.id, 1)}
                              size="small"
                              aria-label="Anadir una unidad"
                              variant="outlined"
                            >
                              <AddRounded fontSize="small" />
                            </Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}

                  {group.personalized.length > 0 && (
                    <Stack spacing={1}>
                      <Typography color="text.secondary" variant="caption">
                        Personalizadas
                      </Typography>
                      {group.personalized.map((balance) => (
                        <Stack
                          key={balance.id}
                          direction={{ xs: "column", md: "row" }}
                          spacing={1.5}
                          sx={{
                            alignItems: { md: "center" },
                            justifyContent: "space-between",
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 2.5,
                            px: 1.5,
                            py: 1.25,
                            bgcolor: "background.paper"
                          }}
                        >
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700} variant="body2">
                              {balance.sizeCode} · {formatLogisticsCustomization(balance.nameCustomization, balance.numberCustomization) ?? "--"}
                            </Typography>
                            <Typography color="text.secondary" variant="caption">
                              {balance.location?.trim() ? balance.location : "Sin ubicacion"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            <Chip color="success" label={`Disp. ${balance.quantityAvailable}`} size="small" />
                            <Chip color="warning" label={`Res. ${balance.quantityReserved}`} size="small" variant="outlined" />
                            {balance.quantityDelivered > 0 && (
                              <Chip label={`Ent. ${balance.quantityDelivered}`} size="small" variant="outlined" />
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                              disabled={stockAdjustmentMutation.isPending || balance.quantityAvailable <= 0}
                              onClick={() => handleQuickAdjustment(balance.id, -1)}
                              size="small"
                              aria-label="Quitar una unidad"
                              variant="outlined"
                            >
                              <RemoveRounded fontSize="small" />
                            </Button>
                            <Button
                              disabled={stockAdjustmentMutation.isPending}
                              onClick={() => handleQuickAdjustment(balance.id, 1)}
                              size="small"
                              aria-label="Anadir una unidad"
                              variant="outlined"
                            >
                              <AddRounded fontSize="small" />
                            </Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState description="No hay saldo de stock para el filtro actual." title="Sin stock" />
          )}

          <Divider />

          <Typography variant="subtitle2">Bandeja de revision</Typography>
          {surplusReviewsQuery.isLoading ? (
            <Stack sx={{ alignItems: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Stack>
          ) : surplusReviewsQuery.data && surplusReviewsQuery.data.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Linea</TableCell>
                  <TableCell>Prenda</TableCell>
                  <TableCell>Talla</TableCell>
                  <TableCell>Personalizacion</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell align="right">Accion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surplusReviewsQuery.data.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{`${review.orderName} / ${review.supplierName}`}</TableCell>
                    <TableCell>{review.orderLineId}</TableCell>
                    <TableCell>{getLogisticsGarmentLabel(review.garmentCategory)}</TableCell>
                    <TableCell>{review.sizeCode}</TableCell>
                    <TableCell>{formatLogisticsCustomization(review.nameCustomization, review.numberCustomization) ?? "--"}</TableCell>
                    <TableCell>{review.quantity}</TableCell>
                    <TableCell align="right">
                      <Button
                        disabled={sendSurplusMutation.isPending}
                        onClick={() => void handleSendToStock(review.id)}
                        size="small"
                        variant="contained"
                      >
                        Mandar a stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary" variant="body2">
              No hay sobrantes pendientes de revision.
            </Typography>
          )}

          <Divider />

          <Typography variant="subtitle2">Ultimos movimientos</Typography>
          {stockMovementsQuery.isLoading ? (
            <Stack sx={{ alignItems: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Stack>
          ) : stockMovementsQuery.data && stockMovementsQuery.data.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Movimiento</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Solicitud</TableCell>
                  <TableCell>Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockMovementsQuery.data.slice(0, 12).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.movementDate}</TableCell>
                    <TableCell>{getLogisticsMovementLabel(movement.movementType)}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.stockBalanceId}</TableCell>
                    <TableCell>{movement.requestId ?? "--"}</TableCell>
                    <TableCell>{movement.notes ?? "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary" variant="body2">
              Aun no hay movimientos registrados.
            </Typography>
          )}
        </Stack>
      </SectionCard>
    </PageContainer>
  );
}
