import { LocalShippingRounded, TaskAltRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import {
  useCreateLogisticsDeliveryMutation,
  useLogisticsDeliveries,
  useLogisticsRequests
} from "../api/logistics-hooks";
import {
  formatLogisticsCustomization,
  getLogisticsGarmentLabel,
  getLogisticsRequestStatusLabel
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

export function LogisticsDeliveriesPage() {
  const { showSuccess } = useAppFeedback();
  const [searchParams] = useSearchParams();
  const seasonIdParam = searchParams.get("seasonId");
  const selectedSeasonId = seasonIdParam ? Number(seasonIdParam) : undefined;

  const requestsQuery = useLogisticsRequests(selectedSeasonId);
  const deliveriesQuery = useLogisticsDeliveries(selectedSeasonId);
  const createDeliveryMutation = useCreateLogisticsDeliveryMutation();

  const deliverableRequests = useMemo(() => {
    return (requestsQuery.data ?? [])
      .filter((request) => request.quantityReserved > 0)
      .sort((a, b) => (a.fullName ?? a.externalRecipientName ?? "").localeCompare(b.fullName ?? b.externalRecipientName ?? ""));
  }, [requestsQuery.data]);

  const handleDelivery = async (requestId: number, quantity: number) => {
    if (!selectedSeasonId) {
      return;
    }

    const request = deliverableRequests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }

    await createDeliveryMutation.mutateAsync({
      seasonId: selectedSeasonId,
      personId: request.personId ?? undefined,
      externalRecipientId: request.personId ? undefined : request.externalRecipientId ?? undefined,
      externalRecipientName: request.personId ? undefined : request.externalRecipientName ?? undefined,
      lines: [
        {
          requestId,
          quantity
        }
      ],
      notes: "Entrega registrada desde cola operativa"
    });

    showSuccess("Entrega registrada.");
  };

  const loading = requestsQuery.isLoading || deliveriesQuery.isLoading;
  const error = getErrorMessage(requestsQuery.error) ?? getErrorMessage(deliveriesQuery.error) ?? getErrorMessage(createDeliveryMutation.error);

  if (loading) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Entregas">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (!selectedSeasonId) {
    return (
      <PageContainer eyebrow="Logistica por temporada" title="Entregas">
        <EmptyState
          title="Selecciona temporada"
          description="Abre la vista con seasonId en la URL para operar entregas."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      eyebrow="Logistica por temporada"
      title="Entregas"
      description="Cada fila representa una prenda ya reservada y lista para entregar."
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <SectionCard
          action={<TaskAltRounded color="primary" />}
          title="Pendientes de entrega"
          subtitle="Solicitudes con stock reservado y listas para cerrar."
        >
          {deliverableRequests.length === 0 ? (
            <EmptyState title="Nada listo para entregar" description="Cuando reserves stock para solicitudes, apareceran aqui." />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Destinatario</TableCell>
                  <TableCell>Prenda</TableCell>
                  <TableCell>Personalizacion</TableCell>
                  <TableCell>Reservado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliverableRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.fullName ?? request.externalRecipientName ?? "--"}</TableCell>
                    <TableCell>{`${getLogisticsGarmentLabel(request.garmentCategory)} / ${request.sizeCode}`}</TableCell>
                    <TableCell>{formatLogisticsCustomization(request.nameCustomization, request.numberCustomization) ?? "--"}</TableCell>
                    <TableCell>{request.quantityReserved}</TableCell>
                    <TableCell>{getLogisticsRequestStatusLabel(request.status)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          disabled={createDeliveryMutation.isPending || request.quantityReserved < 1}
                          size="small"
                          variant="contained"
                          onClick={() => void handleDelivery(request.id, request.quantityReserved)}
                        >
                          Entregar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard
          action={<LocalShippingRounded color="primary" />}
          title="Historico de entregas"
          subtitle="Ultimas entregas registradas en la temporada."
        >
          {deliveriesQuery.data && deliveriesQuery.data.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Destinatario</TableCell>
                  <TableCell>Lineas</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveriesQuery.data.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.deliveredAt}</TableCell>
                    <TableCell>{delivery.recipientName}</TableCell>
                    <TableCell>
                      {delivery.lines
                        .map((line) => `${getLogisticsGarmentLabel(line.garmentCategory)} ${line.sizeCode} x${line.quantity}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{delivery.notes ?? "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary" variant="body2">
              Todavia no hay entregas registradas.
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
