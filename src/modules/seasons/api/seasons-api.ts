import { httpClient } from "../../../shared/api/http-client";
import type { CopySeasonModulesPayload, CreateSeasonPayload, Season, UpdateSeasonPayload } from "../../../shared/types/api";

export function getSeasons(signal?: AbortSignal) {
  return httpClient<Season[]>("/seasons", { signal });
}

export function createSeason(payload: CreateSeasonPayload) {
  return httpClient<Season>("/seasons", {
    method: "POST",
    body: payload
  });
}

export function updateSeason(seasonId: number, payload: UpdateSeasonPayload) {
  return httpClient<Season>(`/seasons/${seasonId}`, {
    method: "PUT",
    body: payload
  });
}

export function copySeasonModules(targetSeasonId: number, payload: CopySeasonModulesPayload) {
  return httpClient<void>(`/seasons/${targetSeasonId}/copy-modules`, {
    method: "POST",
    body: payload
  });
}
