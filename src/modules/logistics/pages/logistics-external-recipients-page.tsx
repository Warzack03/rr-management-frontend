import { AddRounded, PersonRounded, SaveRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Grid2,
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
import { Link } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import {
  useCreateLogisticsExternalRecipientMutation,
  useLogisticsExternalRecipient,
  useLogisticsExternalRecipients,
  useUpdateLogisticsExternalRecipientMutation
} from "../api/logistics-hooks";

function getErrorMessage(error: unknown) {
  if (error instanceof HttpClientError) {
    return error.payload?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return null;
}

export function LogisticsExternalRecipientsPage() {
  const { showError, showSuccess } = useAppFeedback();
  const recipientsQuery = useLogisticsExternalRecipients();
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | undefined>();
  const selectedRecipientQuery = useLogisticsExternalRecipient(selectedRecipientId);
  const createMutation = useCreateLogisticsExternalRecipientMutation();
  const updateMutation = useUpdateLogisticsExternalRecipientMutation();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [dniValue, setDniValue] = useState("");
  const [provenance, setProvenance] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (selectedRecipientQuery.data) {
      setFullName(selectedRecipientQuery.data.fullName);
      setAddress(selectedRecipientQuery.data.address);
      setDniValue(selectedRecipientQuery.data.dniValue);
      setProvenance(selectedRecipientQuery.data.provenance);
      setNotes(selectedRecipientQuery.data.notes ?? "");
    }
  }, [selectedRecipientQuery.data]);

  useEffect(() => {
    if (selectedRecipientId || !(recipientsQuery.data?.length ?? 0)) {
      return;
    }
    setSelectedRecipientId(recipientsQuery.data?.[0].id);
  }, [recipientsQuery.data, selectedRecipientId]);

  const selectedRecipient = selectedRecipientQuery.data;
  const error =
    getErrorMessage(recipientsQuery.error) ??
    getErrorMessage(selectedRecipientQuery.error) ??
    getErrorMessage(createMutation.error) ??
    getErrorMessage(updateMutation.error);

  const sortedRecipients = useMemo(() => recipientsQuery.data ?? [], [recipientsQuery.data]);

  const handleNewRecipient = () => {
    setSelectedRecipientId(undefined);
    setFullName("");
    setAddress("");
    setDniValue("");
    setProvenance("");
    setNotes("");
  };

  const handleSave = async () => {
    const payload = {
      fullName: fullName.trim(),
      address: address.trim(),
      dniValue: dniValue.trim(),
      provenance: provenance.trim(),
      notes: notes.trim() || undefined
    };

    if (!payload.fullName || !payload.address || !payload.dniValue || !payload.provenance) {
      showError("Completa nombre, direccion, DNI y procedencia.");
      return;
    }

    if (selectedRecipientId) {
      const recipient = await updateMutation.mutateAsync({ id: selectedRecipientId, payload });
      setSelectedRecipientId(recipient.id);
      showSuccess("Destinatario externo actualizado.");
      return;
    }

    const recipient = await createMutation.mutateAsync(payload);
    setSelectedRecipientId(recipient.id);
    showSuccess("Destinatario externo creado.");
  };

  if (recipientsQuery.isLoading) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Destinatarios externos">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={(
        <Button component={Link} to="/logistics/equipment" variant="outlined">
          Volver a equipacion
        </Button>
      )}
      description="Ficha maestra de destinatarios externos para reutilizar datos en necesidades y entregas."
      eyebrow="Logistica por temporada"
      title="Destinatarios externos"
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip icon={<PersonRounded />} label={`${sortedRecipients.length} destinatarios`} variant="outlined" />
          <Chip label={selectedRecipient ? selectedRecipient.fullName : "Nueva ficha"} color="primary" variant="outlined" />
        </Stack>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, lg: 5 }}>
            <SectionCard
              action={<PersonRounded color="primary" />}
              subtitle="Selecciona un destinatario o crea uno nuevo"
              title="Listado"
            >
              {sortedRecipients.length === 0 ? (
                <EmptyState description="Todavia no hay destinatarios externos guardados." title="Sin destinatarios" />
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>DNI</TableCell>
                      <TableCell>Procedencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedRecipients.map((recipient) => (
                      <TableRow
                        key={recipient.id}
                        hover
                        selected={selectedRecipientId === recipient.id}
                        onClick={() => setSelectedRecipientId(recipient.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{recipient.fullName}</TableCell>
                        <TableCell>{recipient.dniValue}</TableCell>
                        <TableCell>{recipient.provenance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button onClick={handleNewRecipient} startIcon={<AddRounded />} variant="text">
                  Nueva ficha
                </Button>
              </Stack>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 7 }}>
            <SectionCard
              action={<SaveRounded color="primary" />}
              subtitle="Estos datos viven en logistica y se reutilizan desde extras y entregas"
              title={selectedRecipient ? "Editar destinatario" : "Crear destinatario"}
            >
              <Stack spacing={2}>
                <Grid2 container spacing={2}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Nombre completo" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="DNI" value={dniValue} onChange={(event) => setDniValue(event.target.value)} />
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <TextField fullWidth label="Direccion" value={address} onChange={(event) => setAddress(event.target.value)} />
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Procedencia"
                      value={provenance}
                      onChange={(event) => setProvenance(event.target.value)}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nota"
                      minRows={3}
                      multiline
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </Grid2>
                </Grid2>

                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                  <Button disabled={createMutation.isPending || updateMutation.isPending} onClick={handleSave} variant="contained">
                    {selectedRecipient ? "Guardar cambios" : "Crear destinatario"}
                  </Button>
                </Stack>

                {selectedRecipient && (
                  <SectionCard subtitle="Resumen de la ficha seleccionada" title="Detalle">
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="body2">Nombre</Typography>
                        <Typography>{selectedRecipient.fullName}</Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="body2">DNI</Typography>
                        <Typography>{selectedRecipient.dniValue}</Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="body2">Direccion</Typography>
                        <Typography>{selectedRecipient.address}</Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="body2">Procedencia</Typography>
                        <Typography>{selectedRecipient.provenance}</Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 12, md: 6 }}>
                        <Typography color="text.secondary" variant="body2">Nota</Typography>
                        <Typography>{selectedRecipient.notes ?? "Sin nota"}</Typography>
                      </Grid2>
                    </Grid2>
                  </SectionCard>
                )}
              </Stack>
            </SectionCard>
          </Grid2>
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
