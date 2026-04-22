import { httpClient } from "../../../shared/api/http-client";
import type { PlayerProfile, UpdatePlayerProfilePayload } from "../../../shared/types/api";

export function getPlayerProfile(personId: string, signal?: AbortSignal) {
  return httpClient<PlayerProfile>(`/player-profiles/${personId}`, { signal });
}

export function updatePlayerProfile(personId: string, payload: UpdatePlayerProfilePayload) {
  return httpClient<PlayerProfile>(`/player-profiles/${personId}`, {
    method: "PUT",
    body: payload
  });
}
