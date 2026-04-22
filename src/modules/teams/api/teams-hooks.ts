import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTeamPayload, UpdateTeamPayload } from "../../../shared/types/api";
import { createTeam, deactivateTeam, getActiveTeams, getInactiveTeams, updateTeam } from "./teams-api";

export const teamsKeys = {
  active: ["teams", "active"] as const,
  inactive: ["teams", "inactive"] as const
};

export function useActiveTeams() {
  return useQuery({
    queryKey: teamsKeys.active,
    queryFn: ({ signal }) => getActiveTeams(signal)
  });
}

export function useInactiveTeams() {
  return useQuery({
    queryKey: teamsKeys.inactive,
    queryFn: ({ signal }) => getInactiveTeams(signal)
  });
}

function invalidateTeamViews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: teamsKeys.active });
  queryClient.invalidateQueries({ queryKey: teamsKeys.inactive });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => createTeam(payload),
    onSuccess: () => {
      invalidateTeamViews(queryClient);
    }
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: number; payload: UpdateTeamPayload }) => updateTeam(teamId, payload),
    onSuccess: () => {
      invalidateTeamViews(queryClient);
    }
  });
}

export function useDeactivateTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => deactivateTeam(teamId),
    onSuccess: () => {
      invalidateTeamViews(queryClient);
    }
  });
}
