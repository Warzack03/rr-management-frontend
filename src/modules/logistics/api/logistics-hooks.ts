import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateLogisticsDeliveryPayload,
  CreateLogisticsOrderPayload,
  CreateLogisticsRequestPayload,
  LogisticsExternalRecipient,
  LogisticsGarmentCategory,
  LogisticsRequestStatus,
  ManualLogisticsStockAdjustmentPayload,
  ManualLogisticsStockEntryPayload,
  RegisterLogisticsOrderReceiptPayload,
  ReserveLogisticsRequestPayload,
  UpdateLogisticsOrderPayload,
  UpsertPlayerSeasonGarmentsPayload,
  UpsertLogisticsExternalRecipientPayload
} from "../../../shared/types/api";
import {
  createLogisticsDelivery,
  deleteLogisticsOrder,
  createLogisticsOrder,
  createLogisticsRequest,
  createLogisticsExternalRecipient,
  createManualLogisticsStockAdjustment,
  createManualLogisticsStockEntry,
  generateLogisticsBaseRequests,
  getLogisticsDeliveries,
  getLogisticsExternalRecipient,
  getLogisticsExternalRecipients,
  getLogisticsOrder,
  getLogisticsOrders,
  getPlayerSeasonGarments,
  getLogisticsRequests,
  getLogisticsStock,
  getLogisticsStockMovements,
  getLogisticsStockSurplusReviews,
  registerLogisticsOrderReceipt,
  releaseLogisticsRequest,
  reserveLogisticsRequest,
  sendLogisticsOrder,
  sendLogisticsStockSurplusToStock,
  updateLogisticsOrder,
  updatePlayerSeasonGarments,
  updateLogisticsExternalRecipient
} from "./logistics-api";

export const logisticsKeys = {
  playerSeasonGarments: (personId?: number, seasonId?: number) =>
    ["logistics", "player-season-garments", personId ?? "all", seasonId ?? "default"] as const,
  requests: (seasonId?: number, teamId?: number, personId?: number, status?: LogisticsRequestStatus) =>
    ["logistics", "requests", seasonId ?? "default", teamId ?? "all", personId ?? "all", status ?? "all"] as const,
  stock: (seasonId?: number, garmentCategory?: LogisticsGarmentCategory, sizeCode?: string) =>
    ["logistics", "stock", seasonId ?? "default", garmentCategory ?? "all", sizeCode ?? "all"] as const,
  stockMovements: (seasonId?: number) => ["logistics", "stock-movements", seasonId ?? "default"] as const,
  orders: (seasonId?: number) => ["logistics", "orders", seasonId ?? "default"] as const,
  order: (orderId: number) => ["logistics", "order", orderId] as const,
  deliveries: (seasonId?: number) => ["logistics", "deliveries", seasonId ?? "default"] as const,
  externalRecipients: () => ["logistics", "external-recipients"] as const,
  externalRecipient: (id: number) => ["logistics", "external-recipient", id] as const
};

export function usePlayerSeasonGarments(personId?: number, seasonId?: number) {
  return useQuery({
    queryKey: logisticsKeys.playerSeasonGarments(personId, seasonId),
    queryFn: ({ signal }) => getPlayerSeasonGarments({ personId, seasonId, signal }),
    enabled: Boolean(personId)
  });
}

export function useUpdatePlayerSeasonGarmentsMutation(personId?: number, seasonId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertPlayerSeasonGarmentsPayload) => updatePlayerSeasonGarments(personId as number, payload, seasonId),
    onSuccess: (garments) => {
      queryClient.setQueryData(logisticsKeys.playerSeasonGarments(personId, seasonId), garments);
    }
  });
}

export function useLogisticsRequests(
  seasonId?: number,
  teamId?: number,
  personId?: number,
  status?: LogisticsRequestStatus
) {
  return useQuery({
    queryKey: logisticsKeys.requests(seasonId, teamId, personId, status),
    queryFn: ({ signal }) => getLogisticsRequests({ seasonId, teamId, personId, status, signal })
  });
}

export function useGenerateBaseRequestsMutation(seasonId?: number, teamId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateLogisticsBaseRequests(seasonId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
    }
  });
}

export function useLogisticsExternalRecipients() {
  return useQuery({
    queryKey: logisticsKeys.externalRecipients(),
    queryFn: ({ signal }) => getLogisticsExternalRecipients(signal)
  });
}

export function useLogisticsExternalRecipient(id?: number) {
  return useQuery({
    queryKey: id ? logisticsKeys.externalRecipient(id) : ["logistics", "external-recipient", "none"],
    queryFn: ({ signal }) => getLogisticsExternalRecipient(id as number, signal),
    enabled: Boolean(id)
  });
}

export function useCreateLogisticsExternalRecipientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertLogisticsExternalRecipientPayload) => createLogisticsExternalRecipient(payload),
    onSuccess: (recipient) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.externalRecipients() });
      queryClient.setQueryData(logisticsKeys.externalRecipient(recipient.id), recipient);
    }
  });
}

export function useUpdateLogisticsExternalRecipientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpsertLogisticsExternalRecipientPayload }) =>
      updateLogisticsExternalRecipient(id, payload),
    onSuccess: (recipient) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.externalRecipients() });
      queryClient.setQueryData(logisticsKeys.externalRecipient(recipient.id), recipient);
    }
  });
}

export function useCreateLogisticsRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogisticsRequestPayload) => createLogisticsRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["treasury"] });
    }
  });
}

export function useReserveLogisticsRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: number; payload: ReserveLogisticsRequestPayload }) =>
      reserveLogisticsRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
    }
  });
}

export function useReleaseLogisticsRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: number; payload: ReserveLogisticsRequestPayload }) =>
      releaseLogisticsRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
    }
  });
}

export function useLogisticsStock(seasonId?: number, garmentCategory?: LogisticsGarmentCategory, sizeCode?: string) {
  return useQuery({
    queryKey: logisticsKeys.stock(seasonId, garmentCategory, sizeCode),
    queryFn: ({ signal }) => getLogisticsStock({ seasonId, garmentCategory, sizeCode, signal })
  });
}

export function useLogisticsStockMovements(seasonId?: number) {
  return useQuery({
    queryKey: logisticsKeys.stockMovements(seasonId),
    queryFn: ({ signal }) => getLogisticsStockMovements({ seasonId, signal })
  });
}

export function useLogisticsStockSurplusReviews(seasonId?: number) {
  return useQuery({
    queryKey: ["logistics", "stock-surplus-reviews", seasonId ?? "default"] as const,
    queryFn: ({ signal }) => getLogisticsStockSurplusReviews({ seasonId, signal })
  });
}

export function useManualLogisticsStockEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualLogisticsStockEntryPayload) => createManualLogisticsStockEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useManualLogisticsStockAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualLogisticsStockAdjustmentPayload) => createManualLogisticsStockAdjustment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useSendLogisticsStockSurplusToStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => sendLogisticsStockSurplusToStock(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-surplus-reviews"] });
    }
  });
}

export function useLogisticsOrders(seasonId?: number) {
  return useQuery({
    queryKey: logisticsKeys.orders(seasonId),
    queryFn: ({ signal }) => getLogisticsOrders({ seasonId, signal })
  });
}

export function useLogisticsOrder(orderId?: number) {
  return useQuery({
    queryKey: orderId ? logisticsKeys.order(orderId) : ["logistics", "order", "none"],
    queryFn: ({ signal }) => getLogisticsOrder(orderId as number, signal),
    enabled: Boolean(orderId)
  });
}

export function useCreateLogisticsOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogisticsOrderPayload) => createLogisticsOrder(payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.orders(order.seasonId) });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useUpdateLogisticsOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: UpdateLogisticsOrderPayload }) =>
      updateLogisticsOrder(orderId, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.orders(order.seasonId) });
      queryClient.invalidateQueries({ queryKey: logisticsKeys.order(order.id) });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useDeleteLogisticsOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => deleteLogisticsOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useSendLogisticsOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => sendLogisticsOrder(orderId),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "orders"] });
      queryClient.invalidateQueries({ queryKey: logisticsKeys.order(order.id) });
    }
  });
}

export function useRegisterLogisticsOrderReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload?: RegisterLogisticsOrderReceiptPayload }) =>
      registerLogisticsOrderReceipt(orderId, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "orders"] });
      queryClient.invalidateQueries({ queryKey: logisticsKeys.order(order.id) });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-surplus-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
    }
  });
}

export function useLogisticsDeliveries(seasonId?: number) {
  return useQuery({
    queryKey: logisticsKeys.deliveries(seasonId),
    queryFn: ({ signal }) => getLogisticsDeliveries({ seasonId, signal })
  });
}

export function useCreateLogisticsDeliveryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogisticsDeliveryPayload) => createLogisticsDelivery(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics", "deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["logistics", "stock-movements"] });
    }
  });
}
