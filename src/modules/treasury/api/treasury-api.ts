import { httpClient } from "../../../shared/api/http-client";
import type {
  CreateTreasuryChargePayload,
  CreateTreasuryPaymentPayload,
  TreasuryConfig,
  TreasuryEconomicBlock,
  TreasuryMovement,
  TreasuryObligation,
  TreasuryPersonDetail,
  TreasuryPersonSummary,
  TreasuryStaffReceiver,
  TreasurySummary,
  UpdateTreasuryConfigPayload,
  UpdateTreasuryObligationPayload,
  UpdateTreasuryPersonProfilePayload
} from "../../../shared/types/api";

function withSeasonId(path: string, seasonId?: number) {
  return seasonId ? `${path}${path.includes("?") ? "&" : "?"}seasonId=${seasonId}` : path;
}

export function getTreasurySummary(seasonId?: number, signal?: AbortSignal) {
  return httpClient<TreasurySummary>(withSeasonId("/treasury/summary", seasonId), { signal });
}

export function getTreasuryPersons(params: {
  seasonId?: number;
  status?: string;
  search?: string;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams();
  if (params.seasonId) {
    query.set("seasonId", String(params.seasonId));
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.search) {
    query.set("search", params.search);
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return httpClient<TreasuryPersonSummary[]>(`/treasury/persons${suffix}`, { signal: params.signal });
}

export function getTreasuryPerson(personId: string, seasonId?: number, signal?: AbortSignal) {
  return httpClient<TreasuryPersonDetail>(withSeasonId(`/treasury/persons/${personId}`, seasonId), { signal });
}

export function getTreasuryConfig(seasonId?: number, signal?: AbortSignal) {
  return httpClient<TreasuryConfig>(withSeasonId("/treasury/config", seasonId), { signal });
}

export function updateTreasuryConfig(payload: UpdateTreasuryConfigPayload, seasonId?: number) {
  return httpClient<TreasuryConfig>(withSeasonId("/treasury/config", seasonId), {
    method: "PUT",
    body: payload
  });
}

export function getTreasuryStaffReceivers(signal?: AbortSignal) {
  return httpClient<TreasuryStaffReceiver[]>("/treasury/staff-receivers", { signal });
}

export function getTreasuryEconomicBlocks(signal?: AbortSignal) {
  return httpClient<TreasuryEconomicBlock[]>("/treasury/economic-blocks", { signal });
}

export function generateTreasuryBase(seasonId: number) {
  return httpClient<void>(`/treasury/seasons/${seasonId}/generate-base`, {
    method: "POST"
  });
}

export function createTreasuryCharge(payload: CreateTreasuryChargePayload) {
  return httpClient<TreasuryObligation>("/treasury/charges", {
    method: "POST",
    body: payload
  });
}

export function createTreasuryPayment(payload: CreateTreasuryPaymentPayload) {
  return httpClient<TreasuryMovement>("/treasury/payments", {
    method: "POST",
    body: payload
  });
}

export function updateTreasuryObligation(obligationId: number, payload: UpdateTreasuryObligationPayload) {
  return httpClient<TreasuryObligation>(`/treasury/obligations/${obligationId}`, {
    method: "PATCH",
    body: payload
  });
}

export function deleteTreasuryObligation(obligationId: number) {
  return httpClient<void>(`/treasury/obligations/${obligationId}`, {
    method: "DELETE"
  });
}

export function updateTreasuryPersonProfile(personId: number, payload: UpdateTreasuryPersonProfilePayload, seasonId?: number) {
  return httpClient<TreasuryPersonDetail["profile"]>(withSeasonId(`/treasury/persons/${personId}/profile`, seasonId), {
    method: "PATCH",
    body: payload
  });
}
