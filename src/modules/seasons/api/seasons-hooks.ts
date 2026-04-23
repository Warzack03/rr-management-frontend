import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CopySeasonModulesPayload, CreateSeasonPayload, UpdateSeasonPayload } from "../../../shared/types/api";
import { copySeasonModules, createSeason, getSeasons, updateSeason } from "./seasons-api";

export const seasonsKeys = {
  list: ["seasons", "list"] as const
};

export function useSeasons() {
  return useQuery({
    queryKey: seasonsKeys.list,
    queryFn: ({ signal }) => getSeasons(signal)
  });
}

function invalidateSeasons(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: seasonsKeys.list });
}

export function useCreateSeasonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSeasonPayload) => createSeason(payload),
    onSuccess: () => {
      invalidateSeasons(queryClient);
    }
  });
}

export function useUpdateSeasonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seasonId, payload }: { seasonId: number; payload: UpdateSeasonPayload }) => updateSeason(seasonId, payload),
    onSuccess: () => {
      invalidateSeasons(queryClient);
    }
  });
}

export function useCopySeasonModulesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetSeasonId, payload }: { targetSeasonId: number; payload: CopySeasonModulesPayload }) =>
      copySeasonModules(targetSeasonId, payload),
    onSuccess: () => {
      invalidateSeasons(queryClient);
    }
  });
}
