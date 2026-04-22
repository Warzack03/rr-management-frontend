import { httpClient } from "../../../shared/api/http-client";
import type {
  ChangeTeamPayload,
  CreateTeamAssignmentPayload,
  CurrentTeamAssignment,
  PendingTeamAssignment
} from "../../../shared/types/api";

export function getCurrentAssignments(signal?: AbortSignal) {
  return httpClient<CurrentTeamAssignment[]>("/team-assignments/current", { signal });
}

export function getPendingAssignments(signal?: AbortSignal) {
  return httpClient<PendingTeamAssignment[]>("/team-assignments/pending", { signal });
}

export function createAssignment(payload: CreateTeamAssignmentPayload) {
  return httpClient<CurrentTeamAssignment>("/team-assignments", {
    method: "POST",
    body: payload
  });
}

export function changeAssignment(personId: number, payload: ChangeTeamPayload) {
  return httpClient<CurrentTeamAssignment>(`/team-assignments/${personId}/change-team`, {
    method: "PATCH",
    body: payload
  });
}
