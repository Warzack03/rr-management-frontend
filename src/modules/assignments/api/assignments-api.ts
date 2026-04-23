import { httpClient } from "../../../shared/api/http-client";
import type {
  ChangeTeamPayload,
  CreateTeamAssignmentPayload,
  CurrentTeamAssignment,
  PendingTeamAssignment
} from "../../../shared/types/api";
import type { UpdateTeamAssignmentPayload } from "../../../shared/types/api";

export function getCurrentAssignments(signal?: AbortSignal) {
  return httpClient<CurrentTeamAssignment[]>("/team-assignments/current", { signal });
}

export function getPendingAssignments(signal?: AbortSignal) {
  return httpClient<PendingTeamAssignment[]>("/team-assignments/pending", { signal });
}

export function getCurrentAssignmentsBySeason(seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<CurrentTeamAssignment[]>(`/team-assignments/current${query}`, { signal });
}

export function getPendingAssignmentsBySeason(seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<PendingTeamAssignment[]>(`/team-assignments/pending${query}`, { signal });
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

export function updateAssignment(assignmentId: number, payload: UpdateTeamAssignmentPayload) {
  return httpClient<CurrentTeamAssignment>(`/team-assignments/${assignmentId}`, {
    method: "PATCH",
    body: payload
  });
}
