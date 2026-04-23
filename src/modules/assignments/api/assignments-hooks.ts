import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeTeamPayload, CreateTeamAssignmentPayload, UpdateTeamAssignmentPayload } from "../../../shared/types/api";
import {
  createAssignment,
  changeAssignment,
  getCurrentAssignmentsBySeason,
  getPendingAssignmentsBySeason,
  updateAssignment
} from "./assignments-api";

export const assignmentsKeys = {
  current: (seasonId?: number) => ["assignments", "current", seasonId ?? "default"] as const,
  pending: (seasonId?: number) => ["assignments", "pending", seasonId ?? "default"] as const
};

export function useCurrentAssignments(seasonId?: number) {
  return useQuery({
    queryKey: assignmentsKeys.current(seasonId),
    queryFn: ({ signal }) => getCurrentAssignmentsBySeason(seasonId, signal)
  });
}

export function usePendingAssignments(seasonId?: number) {
  return useQuery({
    queryKey: assignmentsKeys.pending(seasonId),
    queryFn: ({ signal }) => getPendingAssignmentsBySeason(seasonId, signal)
  });
}

function invalidateAssignmentViews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["assignments", "current"] });
  queryClient.invalidateQueries({ queryKey: ["assignments", "pending"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamAssignmentPayload) => createAssignment(payload),
    onSuccess: () => {
      invalidateAssignmentViews(queryClient);
    }
  });
}

export function useChangeAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, payload }: { personId: number; payload: ChangeTeamPayload }) => changeAssignment(personId, payload),
    onSuccess: () => {
      invalidateAssignmentViews(queryClient);
    }
  });
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number; payload: UpdateTeamAssignmentPayload }) =>
      updateAssignment(assignmentId, payload),
    onSuccess: () => {
      invalidateAssignmentViews(queryClient);
    }
  });
}
