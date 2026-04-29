import { httpClient } from "../../../shared/api/http-client";
import type {
  LogisticsExternalRecipient,
  CreateLogisticsRequestPayload,
  CreateLogisticsDeliveryPayload,
  CreateLogisticsOrderPayload,
  LogisticsEquipmentDetail,
  LogisticsEquipmentSummary,
  LogisticsDelivery,
  LogisticsGarmentCategory,
  LogisticsRequest,
  LogisticsRequestStatus,
  LogisticsSupplierOrder,
  LogisticsStockBalance,
  LogisticsStockMovement,
  LogisticsStockSurplusReview,
  ManualLogisticsStockAdjustmentPayload,
  ManualLogisticsStockEntryPayload,
  RegisterLogisticsOrderReceiptPayload,
  ReserveLogisticsRequestPayload,
  UpdateLogisticsOrderPayload,
  UpdateLogisticsEquipmentPayload,
  UpsertLogisticsExternalRecipientPayload
} from "../../../shared/types/api";

export function getLogisticsEquipment(params: { seasonId?: number; teamId?: number; signal?: AbortSignal }) {
  const query = new URLSearchParams();
  if (params.seasonId) {
    query.set("seasonId", String(params.seasonId));
  }
  if (params.teamId) {
    query.set("teamId", String(params.teamId));
  }

  return httpClient<LogisticsEquipmentSummary[]>(`/logistics/equipment${query.size > 0 ? `?${query.toString()}` : ""}`, {
    signal: params.signal
  });
}

export function getLogisticsEquipmentDetail(personId: string, seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<LogisticsEquipmentDetail>(`/logistics/equipment/${personId}${query}`, { signal });
}

export function updateLogisticsEquipment(personId: string, payload: UpdateLogisticsEquipmentPayload, seasonId?: number) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<LogisticsEquipmentDetail>(`/logistics/equipment/${personId}${query}`, {
    method: "PUT",
    body: payload
  });
}

export function getLogisticsRequests(params: {
  seasonId?: number;
  teamId?: number;
  personId?: number;
  status?: LogisticsRequestStatus;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams();
  if (params.seasonId) {
    query.set("seasonId", String(params.seasonId));
  }
  if (params.teamId) {
    query.set("teamId", String(params.teamId));
  }
  if (params.personId) {
    query.set("personId", String(params.personId));
  }
  if (params.status) {
    query.set("status", params.status);
  }

  return httpClient<LogisticsRequest[]>(`/logistics/requests${query.size > 0 ? `?${query.toString()}` : ""}`, {
    signal: params.signal
  });
}

export function generateLogisticsBaseRequests(seasonId?: number, teamId?: number) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<LogisticsRequest[]>(`/logistics/requests/generate-base-requests${query}`, {
    method: "POST",
    body: teamId ? { teamId } : {}
  });
}

export function getLogisticsExternalRecipients(signal?: AbortSignal) {
  return httpClient<LogisticsExternalRecipient[]>("/logistics/external-recipients", {
    signal
  });
}

export function getLogisticsExternalRecipient(id: number, signal?: AbortSignal) {
  return httpClient<LogisticsExternalRecipient>(`/logistics/external-recipients/${id}`, {
    signal
  });
}

export function createLogisticsExternalRecipient(payload: UpsertLogisticsExternalRecipientPayload) {
  return httpClient<LogisticsExternalRecipient>("/logistics/external-recipients", {
    method: "POST",
    body: payload
  });
}

export function updateLogisticsExternalRecipient(id: number, payload: UpsertLogisticsExternalRecipientPayload) {
  return httpClient<LogisticsExternalRecipient>(`/logistics/external-recipients/${id}`, {
    method: "PUT",
    body: payload
  });
}

export function createLogisticsRequest(payload: CreateLogisticsRequestPayload) {
  return httpClient<LogisticsRequest>("/logistics/requests", {
    method: "POST",
    body: payload
  });
}

export function reserveLogisticsRequest(requestId: number, payload: ReserveLogisticsRequestPayload) {
  return httpClient<LogisticsRequest>(`/logistics/requests/${requestId}/reserve`, {
    method: "POST",
    body: payload
  });
}

export function releaseLogisticsRequest(requestId: number, payload: ReserveLogisticsRequestPayload) {
  return httpClient<LogisticsRequest>(`/logistics/requests/${requestId}/release`, {
    method: "POST",
    body: payload
  });
}

export function getLogisticsStock(params: {
  seasonId?: number;
  garmentCategory?: LogisticsGarmentCategory;
  sizeCode?: string;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams();
  if (params.seasonId) {
    query.set("seasonId", String(params.seasonId));
  }
  if (params.garmentCategory) {
    query.set("garmentCategory", params.garmentCategory);
  }
  if (params.sizeCode) {
    query.set("sizeCode", params.sizeCode);
  }

  return httpClient<LogisticsStockBalance[]>(`/logistics/stock${query.size > 0 ? `?${query.toString()}` : ""}`, {
    signal: params.signal
  });
}

export function getLogisticsStockMovements(params: { seasonId?: number; signal?: AbortSignal }) {
  const query = params.seasonId ? `?seasonId=${params.seasonId}` : "";
  return httpClient<LogisticsStockMovement[]>(`/logistics/stock-movements${query}`, {
    signal: params.signal
  });
}

export function getLogisticsStockSurplusReviews(params: { seasonId?: number; signal?: AbortSignal }) {
  const query = params.seasonId ? `?seasonId=${params.seasonId}` : "";
  return httpClient<LogisticsStockSurplusReview[]>(`/logistics/stock/review-queue${query}`, {
    signal: params.signal
  });
}

export function createManualLogisticsStockEntry(payload: ManualLogisticsStockEntryPayload) {
  return httpClient<LogisticsStockBalance>("/logistics/stock/manual-entry", {
    method: "POST",
    body: payload
  });
}

export function createManualLogisticsStockAdjustment(payload: ManualLogisticsStockAdjustmentPayload) {
  return httpClient<LogisticsStockBalance>("/logistics/stock/manual-adjustment", {
    method: "PATCH",
    body: payload
  });
}

export function sendLogisticsStockSurplusToStock(reviewId: number) {
  return httpClient<LogisticsStockSurplusReview>(`/logistics/stock/send-to-surplus/${reviewId}`, {
    method: "POST"
  });
}

export function getLogisticsOrders(params: { seasonId?: number; signal?: AbortSignal }) {
  const query = params.seasonId ? `?seasonId=${params.seasonId}` : "";
  return httpClient<LogisticsSupplierOrder[]>(`/logistics/orders${query}`, {
    signal: params.signal
  });
}

export function getLogisticsOrder(orderId: number, signal?: AbortSignal) {
  return httpClient<LogisticsSupplierOrder>(`/logistics/orders/${orderId}`, { signal });
}

export function createLogisticsOrder(payload: CreateLogisticsOrderPayload) {
  return httpClient<LogisticsSupplierOrder>("/logistics/orders", {
    method: "POST",
    body: payload
  });
}

export function updateLogisticsOrder(orderId: number, payload: UpdateLogisticsOrderPayload) {
  return httpClient<LogisticsSupplierOrder>(`/logistics/orders/${orderId}`, {
    method: "PUT",
    body: payload
  });
}

export function deleteLogisticsOrder(orderId: number) {
  return httpClient<void>(`/logistics/orders/${orderId}`, {
    method: "DELETE"
  });
}

export function sendLogisticsOrder(orderId: number) {
  return httpClient<LogisticsSupplierOrder>(`/logistics/orders/${orderId}/send`, {
    method: "POST"
  });
}

export function registerLogisticsOrderReceipt(orderId: number, payload?: RegisterLogisticsOrderReceiptPayload) {
  return httpClient<LogisticsSupplierOrder>(`/logistics/orders/${orderId}/receipts`, {
    method: "POST",
    body: payload ?? {}
  });
}

export function getLogisticsDeliveries(params: { seasonId?: number; signal?: AbortSignal }) {
  const query = params.seasonId ? `?seasonId=${params.seasonId}` : "";
  return httpClient<LogisticsDelivery[]>(`/logistics/deliveries${query}`, {
    signal: params.signal
  });
}

export function createLogisticsDelivery(payload: CreateLogisticsDeliveryPayload) {
  return httpClient<LogisticsDelivery>("/logistics/deliveries", {
    method: "POST",
    body: payload
  });
}
