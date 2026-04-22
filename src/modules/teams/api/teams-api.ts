import { httpClient } from "../../../shared/api/http-client";
import type { CreateTeamPayload, Team, UpdateTeamPayload } from "../../../shared/types/api";

export function getActiveTeams(signal?: AbortSignal) {
  return httpClient<Team[]>("/teams", { signal });
}

export function getInactiveTeams(signal?: AbortSignal) {
  return httpClient<Team[]>("/teams/inactive", { signal });
}

export function createTeam(payload: CreateTeamPayload) {
  return httpClient<Team>("/teams", {
    method: "POST",
    body: payload
  });
}

export function updateTeam(teamId: number, payload: UpdateTeamPayload) {
  return httpClient<Team>(`/teams/${teamId}`, {
    method: "PUT",
    body: payload
  });
}

export function deactivateTeam(teamId: number) {
  return httpClient<Team>(`/teams/${teamId}`, {
    method: "DELETE"
  });
}
