import { httpClient } from "../../../shared/api/http-client";
import type { PlayerProfile, UpdatePlayerProfilePayload } from "../../../shared/types/api";

export function getPlayerProfile(personId: string, seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<PlayerProfile>(`/player-profiles/${personId}${query}`, { signal });
}

export function updatePlayerProfile(personId: string, payload: UpdatePlayerProfilePayload, seasonId?: number) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<PlayerProfile>(`/player-profiles/${personId}${query}`, {
    method: "PUT",
    body: payload
  });
}
