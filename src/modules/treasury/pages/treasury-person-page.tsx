import {
  DeleteOutlineRounded,
  MonetizationOnRounded,
  ReceiptLongRounded,
  SaveRounded
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Grid2,
  MenuItem,
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
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { KpiCard } from "../../../shared/components/data-display/kpi-card";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import {
  useCreateTreasuryChargeMutation,
  useCreateTreasuryPaymentMutation,
  useDeleteTreasuryObligationMutation,
  useTreasuryConfig,
  useTreasuryEconomicBlocks,
  useTreasuryPerson,
  useTreasuryStaffReceivers,
  useUpdateTreasuryObligationMutation,
  useUpdateTreasuryPersonProfileMutation
} from "../api/treasury-hooks";
import { TreasuryPaymentStatusChip } from "../components/treasury-payment-status-chip";
import {
  formatCurrency,
  getTreasuryConceptLabel,
  getTreasuryPaymentMethodLabel,
  getTreasuryPlayerConditionLabel
} from "../model/treasury-ui";

type ObligationDraft = {
  obligationId: number | null;
  expectedAmount: number;
  dueDate: string;
  notes: string;
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayIso() {
  return formatDateInput(new Date());
}

function getNextMonthIso() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return formatDateInput(date);
}

function getInitialChargeDraft() {
  return {
    amount: "",
    dueDate: getNextMonthIso(),
    notes: ""
  };
}

function getInitialPaymentDraft() {
  return {
    paymentMethod: "TRANSFER" as "CASH" | "TRANSFER" | "BIZUM",
    amount: "",
    movementDate: getTodayIso(),
    receivedByPersonId: "",
    notes: ""
  };
}

export function TreasuryPersonPage() {
  const { personId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const resolvedSeasonId = seasonId ? Number(seasonId) : undefined;
  const { showSuccess } = useAppFeedback();
  const detailQuery = useTreasuryPerson(personId, resolvedSeasonId);
  const configQuery = useTreasuryConfig(resolvedSeasonId);
  const blocksQuery = useTreasuryEconomicBlocks();
  const staffReceiversQuery = useTreasuryStaffReceivers();
  const updateProfileMutation = useUpdateTreasuryPersonProfileMutation(Number(personId), resolvedSeasonId);
  const updateObligationMutation = useUpdateTreasuryObligationMutation();
  const deleteObligationMutation = useDeleteTreasuryObligationMutation();
  const createChargeMutation = useCreateTreasuryChargeMutation();
  const createPaymentMutation = useCreateTreasuryPaymentMutation();

  const [profileDraft, setProfileDraft] = useState({
    economicBlockId: 0,
    playerCondition: "NEW" as "NEW" | "RETURNING",
    manualOverride: false,
    notes: ""
  });
  const [chargeDraft, setChargeDraft] = useState(getInitialChargeDraft);
  const [paymentDraft, setPaymentDraft] = useState(getInitialPaymentDraft);
  const [obligationDraft, setObligationDraft] = useState<ObligationDraft>({
    obligationId: null,
    expectedAmount: 0,
    dueDate: "",
    notes: ""
  });

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    setProfileDraft({
      economicBlockId: detailQuery.data.profile.economicBlockId,
      playerCondition: detailQuery.data.profile.playerCondition,
      manualOverride: detailQuery.data.profile.manualOverride,
      notes: detailQuery.data.profile.notes ?? ""
    });
  }, [detailQuery.data]);

  if (
    detailQuery.isLoading ||
    configQuery.isLoading ||
    blocksQuery.isLoading ||
    staffReceiversQuery.isLoading
  ) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Detalle economico">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (
    detailQuery.isError ||
    configQuery.isError ||
    !detailQuery.data ||
    !configQuery.data ||
    !blocksQuery.data ||
    !staffReceiversQuery.data
  ) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Detalle economico">
        <EmptyState description="No hemos podido cargar el detalle economico de esta persona." title="Detalle no disponible" />
      </PageContainer>
    );
  }

  const person = detailQuery.data;
  const readOnly = configQuery.data.readOnly;
  const seasonQuery = resolvedSeasonId ? `?seasonId=${resolvedSeasonId}` : "";
  const profileError =
    updateProfileMutation.error instanceof HttpClientError
      ? updateProfileMutation.error.payload?.message ?? updateProfileMutation.error.message
      : updateProfileMutation.error?.message;
  const chargeError =
    createChargeMutation.error instanceof HttpClientError
      ? createChargeMutation.error.payload?.message ?? createChargeMutation.error.message
      : createChargeMutation.error?.message;
  const paymentError =
    createPaymentMutation.error instanceof HttpClientError
      ? createPaymentMutation.error.payload?.message ?? createPaymentMutation.error.message
      : createPaymentMutation.error?.message;
  const obligationError =
    updateObligationMutation.error instanceof HttpClientError
      ? updateObligationMutation.error.payload?.message ?? updateObligationMutation.error.message
      : deleteObligationMutation.error instanceof HttpClientError
        ? deleteObligationMutation.error.payload?.message ?? deleteObligationMutation.error.message
        : updateObligationMutation.error?.message ?? deleteObligationMutation.error?.message;

  const onSaveProfile = async () => {
    await updateProfileMutation.mutateAsync({
      economicBlockId: profileDraft.economicBlockId,
      playerCondition: profileDraft.playerCondition,
      manualOverride: profileDraft.manualOverride,
      notes: profileDraft.notes.trim() || undefined
    });
    showSuccess("Perfil economico actualizado.");
  };

  const onCreateCharge = async () => {
    await createChargeMutation.mutateAsync({
      personId: Number(personId),
      seasonId: configQuery.data.seasonId,
      conceptCode: "EXTRA_EQUIPMENT",
      amount: Number(chargeDraft.amount),
      dueDate: chargeDraft.dueDate || undefined,
      notes: chargeDraft.notes.trim() || undefined
    });
    setChargeDraft(getInitialChargeDraft());
    showSuccess("Cargo extra registrado.");
  };

  const onCreatePayment = async () => {
    await createPaymentMutation.mutateAsync({
      personId: Number(personId),
      seasonId: configQuery.data.seasonId,
      paymentMethod: paymentDraft.paymentMethod,
      amount: Number(paymentDraft.amount),
      movementDate: paymentDraft.movementDate || undefined,
      receivedByPersonId:
        paymentDraft.paymentMethod === "TRANSFER" || paymentDraft.receivedByPersonId === ""
          ? undefined
          : Number(paymentDraft.receivedByPersonId),
      notes: paymentDraft.notes.trim() || undefined
    });
    setPaymentDraft(getInitialPaymentDraft());
    showSuccess("Cobro registrado.");
  };

  const onSaveObligation = async () => {
    if (!obligationDraft.obligationId) {
      return;
    }

    await updateObligationMutation.mutateAsync({
      obligationId: obligationDraft.obligationId,
      payload: {
        expectedAmount: obligationDraft.expectedAmount,
        dueDate: obligationDraft.dueDate || undefined,
        notes: obligationDraft.notes.trim() || undefined
      }
    });
    setObligationDraft({ obligationId: null, expectedAmount: 0, dueDate: "", notes: "" });
    showSuccess("Obligacion actualizada.");
  };

  const onDeleteObligation = async (obligationId: number) => {
    await deleteObligationMutation.mutateAsync(obligationId);
    if (obligationDraft.obligationId === obligationId) {
      setObligationDraft({ obligationId: null, expectedAmount: 0, dueDate: "", notes: "" });
    }
    showSuccess("Cargo pendiente eliminado.");
  };

  return (
    <PageContainer
      actions={
        <Button component={Link} to={`/treasury${seasonQuery}`} variant="outlined">
          Volver a tesoreria
        </Button>
      }
      description="Detalle economico de temporada con perfil, obligaciones y movimientos."
      eyebrow="Tesoreria V2"
      title={person.fullName}
    >
      <Stack spacing={3}>
        <SectionCard subtitle={`${person.nifValue} - ${person.currentTeamName ?? "Sin equipo"}`} title="Resumen economico">
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip color={person.active ? "success" : "default"} label={person.active ? "Activo" : "Inactivo"} />
            <Chip label={person.profile.economicBlockName} />
            <Chip label={getTreasuryPlayerConditionLabel(person.profile.playerCondition)} />
            <TreasuryPaymentStatusChip overdueAmount={person.totalOverdue} pendingAmount={person.totalPending} />
            {person.profile.manualOverride && <Chip color="warning" label="Override manual" />}
          </Stack>
        </SectionCard>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="blue" label="Previsto" value={formatCurrency(person.totalExpected)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="neutral" label="Cobrado" value={formatCurrency(person.totalCollected)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="gold" label="Pendiente" value={formatCurrency(person.totalPending)} />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, xl: 3 }}>
            <KpiCard accent="gold" label="Vencido" value={formatCurrency(person.totalOverdue)} />
          </Grid2>
        </Grid2>

        {readOnly && (
          <Alert severity="warning">
            La temporada esta cerrada. Esta ficha queda en solo lectura para preservar el historico economico.
          </Alert>
        )}

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, xl: 4 }}>
            <SectionCard subtitle="Corrige bloque o condicion cuando el calculo automatico no encaje con este caso." title="Perfil economico">
              <Stack spacing={2}>
                {profileError && <Alert severity="error">{profileError}</Alert>}
                <TextField
                  disabled={!profileDraft.manualOverride}
                  fullWidth
                  label="Bloque economico"
                  required
                  select
                  value={profileDraft.economicBlockId}
                  onChange={(event) => setProfileDraft((prev) => ({ ...prev, economicBlockId: Number(event.target.value) }))}
                >
                  {blocksQuery.data.map((block) => (
                    <MenuItem key={block.id} value={block.id}>
                      {block.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  disabled={!profileDraft.manualOverride}
                  fullWidth
                  label="Condicion"
                  required
                  select
                  value={profileDraft.playerCondition}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      playerCondition: event.target.value as "NEW" | "RETURNING"
                    }))
                  }
                >
                  <MenuItem value="NEW">Nuevo</MenuItem>
                  <MenuItem value="RETURNING">Renovado</MenuItem>
                </TextField>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                  <Stack spacing={0.35} sx={{ maxWidth: 320 }}>
                    <Typography>Override manual</Typography>
                    <Typography color="text.secondary" variant="body2">
                      Al activarlo puedes fijar manualmente bloque y condicion para esta temporada. Los importes se ajustan por separado en la tabla de obligaciones.
                    </Typography>
                  </Stack>
                  <Switch
                    checked={profileDraft.manualOverride}
                    onChange={(_event, checked) => setProfileDraft((prev) => ({ ...prev, manualOverride: checked }))}
                  />
                </Stack>
                <Alert severity={profileDraft.manualOverride ? "warning" : "info"}>
                  {profileDraft.manualOverride
                    ? "Modo manual activo: revisa y edita cada obligacion por separado en el bloque inferior."
                    : `Importe previsto actual: ${formatCurrency(person.totalExpected)}`}
                </Alert>
                <TextField
                  fullWidth
                  label="Notas del perfil"
                  minRows={3}
                  multiline
                  value={profileDraft.notes}
                  onChange={(event) => setProfileDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button disabled={readOnly || updateProfileMutation.isPending} onClick={onSaveProfile} startIcon={<SaveRounded />} variant="contained">
                  Guardar perfil
                </Button>
              </Stack>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 4 }}>
            <SectionCard action={<ReceiptLongRounded color="primary" />} subtitle="Registra cargos extraordinarios ligados a ropa o ajustes puntuales." title="Nuevo cargo">
              <Stack spacing={2}>
                {chargeError && <Alert severity="error">{chargeError}</Alert>}
                <TextField
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  label="Importe"
                  required
                  type="number"
                  value={chargeDraft.amount}
                  onChange={(event) => setChargeDraft((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  fullWidth
                  helperText="Por defecto se propone un mes desde hoy."
                  InputLabelProps={{ shrink: true }}
                  label="Vencimiento"
                  type="date"
                  value={chargeDraft.dueDate}
                  onChange={(event) => setChargeDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Notas"
                  minRows={3}
                  multiline
                  value={chargeDraft.notes}
                  onChange={(event) => setChargeDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button disabled={readOnly || createChargeMutation.isPending || Number(chargeDraft.amount) <= 0} onClick={onCreateCharge} variant="contained">
                  Registrar cargo
                </Button>
              </Stack>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, xl: 4 }}>
            <SectionCard action={<MonetizationOnRounded color="primary" />} subtitle="El cobro se aplica automaticamente contra las obligaciones pendientes mas antiguas." title="Nuevo cobro">
              <Stack spacing={2}>
                {paymentError && <Alert severity="error">{paymentError}</Alert>}
                <TextField
                  fullWidth
                  label="Metodo de pago"
                  required
                  select
                  value={paymentDraft.paymentMethod}
                  onChange={(event) =>
                    setPaymentDraft((prev) => ({
                      ...prev,
                      paymentMethod: event.target.value as "CASH" | "TRANSFER" | "BIZUM"
                    }))
                  }
                >
                  <MenuItem value="TRANSFER">Transferencia</MenuItem>
                  <MenuItem value="CASH">Efectivo</MenuItem>
                  <MenuItem value="BIZUM">Bizum</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  label="Importe"
                  required
                  type="number"
                  value={paymentDraft.amount}
                  onChange={(event) => setPaymentDraft((prev) => ({ ...prev, amount: event.target.value }))}
                />
                <TextField
                  fullWidth
                  helperText="Por defecto se propone la fecha de hoy."
                  InputLabelProps={{ shrink: true }}
                  label="Fecha de cobro"
                  type="date"
                  value={paymentDraft.movementDate}
                  onChange={(event) => setPaymentDraft((prev) => ({ ...prev, movementDate: event.target.value }))}
                />
                {paymentDraft.paymentMethod !== "TRANSFER" && (
                  <TextField
                    fullWidth
                    label="Staff receptor"
                    required
                    select
                    value={paymentDraft.receivedByPersonId}
                    onChange={(event) => setPaymentDraft((prev) => ({ ...prev, receivedByPersonId: event.target.value }))}
                  >
                    <MenuItem value="">Selecciona staff</MenuItem>
                    {staffReceiversQuery.data.map((receiver) => (
                      <MenuItem key={receiver.id} value={receiver.id}>
                        {receiver.fullName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField
                  fullWidth
                  label="Notas"
                  minRows={3}
                  multiline
                  value={paymentDraft.notes}
                  onChange={(event) => setPaymentDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Button
                  disabled={
                    readOnly ||
                    createPaymentMutation.isPending ||
                    Number(paymentDraft.amount) <= 0 ||
                    (paymentDraft.paymentMethod !== "TRANSFER" && paymentDraft.receivedByPersonId === "")
                  }
                  onClick={onCreatePayment}
                  variant="contained"
                >
                  Registrar cobro
                </Button>
              </Stack>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Stack spacing={3}>
              <SectionCard
                subtitle={
                  profileDraft.manualOverride
                    ? "Modo manual activo: ajusta cada obligacion de forma independiente."
                    : "Obligaciones activas en la temporada seleccionada."
                }
                title="Obligaciones"
              >
                {person.obligations.length === 0 ? (
                  <EmptyState description="Esta persona todavia no tiene obligaciones economicas registradas." title="Sin obligaciones" />
                ) : (
                  <Stack spacing={2}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Concepto</TableCell>
                          <TableCell align="right">Previsto</TableCell>
                          <TableCell align="right">Cobrado</TableCell>
                          <TableCell align="right">Pendiente</TableCell>
                          <TableCell>Vence</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Accion</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {person.obligations.map((obligation) => (
                          <TableRow key={obligation.id} hover>
                            <TableCell>
                              <Stack spacing={0.35}>
                                <Typography fontWeight={600}>{getTreasuryConceptLabel(obligation.conceptCode)}</Typography>
                                <Typography color="text.secondary" variant="body2">
                                  {obligation.teamName ?? "Sin equipo"} - {obligation.activatedAt}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(obligation.expectedAmount)}</TableCell>
                            <TableCell align="right">{formatCurrency(obligation.collectedAmount)}</TableCell>
                            <TableCell align="right">{formatCurrency(obligation.pendingAmount)}</TableCell>
                            <TableCell>{obligation.dueDate}</TableCell>
                            <TableCell>
                              <TreasuryPaymentStatusChip obligationStatus={obligation.status} overdue={obligation.overdue} />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                <Button
                                  color={profileDraft.manualOverride ? "warning" : "primary"}
                                  disabled={readOnly}
                                  onClick={() =>
                                    setObligationDraft({
                                      obligationId: obligation.id,
                                      expectedAmount: obligation.expectedAmount,
                                      dueDate: obligation.dueDate,
                                      notes: obligation.notes ?? ""
                                    })
                                  }
                                  size="small"
                                  variant="outlined"
                                >
                                  {profileDraft.manualOverride ? "Editar importe manual" : "Editar"}
                                </Button>
                                {obligation.deletable && (
                                  <Button
                                    color="error"
                                    disabled={readOnly || deleteObligationMutation.isPending}
                                    onClick={() => void onDeleteObligation(obligation.id)}
                                    size="small"
                                    startIcon={<DeleteOutlineRounded />}
                                    variant="outlined"
                                  >
                                    Eliminar cargo
                                  </Button>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {obligationDraft.obligationId && (
                      <Stack spacing={2}>
                        {obligationError && <Alert severity="error">{obligationError}</Alert>}
                        <Typography fontWeight={600}>Editar obligacion #{obligationDraft.obligationId}</Typography>
                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              inputProps={{ min: 0.01, step: 0.01 }}
                              label="Importe previsto"
                              required
                              type="number"
                              value={obligationDraft.expectedAmount}
                              onChange={(event) =>
                                setObligationDraft((prev) => ({
                                  ...prev,
                                  expectedAmount: Number(event.target.value)
                                }))
                              }
                            />
                          </Grid2>
                          <Grid2 size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              label="Vencimiento"
                              type="date"
                              value={obligationDraft.dueDate}
                              onChange={(event) => setObligationDraft((prev) => ({ ...prev, dueDate: event.target.value }))}
                            />
                          </Grid2>
                          <Grid2 size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              label="Notas"
                              value={obligationDraft.notes}
                              onChange={(event) => setObligationDraft((prev) => ({ ...prev, notes: event.target.value }))}
                            />
                          </Grid2>
                        </Grid2>
                        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                          <Button onClick={() => setObligationDraft({ obligationId: null, expectedAmount: 0, dueDate: "", notes: "" })} variant="outlined">
                            Cancelar
                          </Button>
                          <Button disabled={readOnly || updateObligationMutation.isPending} onClick={onSaveObligation} startIcon={<SaveRounded />} variant="contained">
                            Guardar obligacion
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                )}
              </SectionCard>

              <SectionCard subtitle="Historial de cargos y cobros registrados sobre esta persona." title="Movimientos">
                {person.movements.length === 0 ? (
                  <EmptyState description="Aun no hay movimientos economicos registrados para esta temporada." title="Sin movimientos" />
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Metodo</TableCell>
                        <TableCell align="right">Importe</TableCell>
                        <TableCell>Detalle</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {person.movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{movement.movementDate}</TableCell>
                          <TableCell>{movement.movementType}</TableCell>
                          <TableCell>{movement.paymentMethod ? getTreasuryPaymentMethodLabel(movement.paymentMethod) : "-"}</TableCell>
                          <TableCell align="right">{formatCurrency(movement.amount)}</TableCell>
                          <TableCell>
                            <Stack spacing={0.35}>
                              {movement.receivedByName && (
                                <Typography color="text.secondary" variant="body2">
                                  Recibido por {movement.receivedByName}
                                </Typography>
                              )}
                              {movement.allocations.length > 0 && (
                                <Typography color="text.secondary" variant="body2">
                                  {movement.allocations
                                    .map(
                                      (allocation) =>
                                        `${getTreasuryConceptLabel(allocation.obligationConceptCode)} (${formatCurrency(allocation.allocatedAmount)})`
                                    )
                                    .join(" - ")}
                                </Typography>
                              )}
                              {movement.notes && <Typography variant="body2">{movement.notes}</Typography>}
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
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
