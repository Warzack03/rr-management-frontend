import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdatePlayerProfilePayload } from "../../../shared/types/api";
import { getPlayerProfile, updatePlayerProfile } from "./player-profiles-api";

export const playerProfileKeys = {
  detail: (personId: string, seasonId?: number) => ["player-profile", personId, seasonId ?? "default"] as const
};

export function usePlayerProfile(personId: string, seasonId?: number) {
  return useQuery({
    queryKey: playerProfileKeys.detail(personId, seasonId),
    queryFn: ({ signal }) => getPlayerProfile(personId, seasonId, signal),
    enabled: Boolean(personId)
  });
}

export function useUpdatePlayerProfileMutation(personId: string, seasonId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePlayerProfilePayload) => updatePlayerProfile(personId, payload, seasonId),
    onSuccess: (profile) => {
      queryClient.setQueryData(playerProfileKeys.detail(personId, seasonId), profile);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
