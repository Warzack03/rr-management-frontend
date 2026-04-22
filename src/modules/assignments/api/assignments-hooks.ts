import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeTeamPayload, CreateTeamAssignmentPayload } from "../../../shared/types/api";
import { dashboardKeys } from "../../dashboard/api/dashboard-hooks";
import { createAssignment, changeAssignment, getCurrentAssignments, getPendingAssignments } from "./assignments-api";

export const assignmentsKeys = {
  current: ["assignments", "current"] as const,
  pending: ["assignments", "pending"] as const
};

export function useCurrentAssignments() {
  return useQuery({
    queryKey: assignmentsKeys.current,
    queryFn: ({ signal }) => getCurrentAssignments(signal)
  });
}

export function usePendingAssignments() {
  return useQuery({
    queryKey: assignmentsKeys.pending,
    queryFn: ({ signal }) => getPendingAssignments(signal)
  });
}

function invalidateAssignmentViews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: assignmentsKeys.current });
  queryClient.invalidateQueries({ queryKey: assignmentsKeys.pending });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
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
