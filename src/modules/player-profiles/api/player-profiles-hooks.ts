import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdatePlayerProfilePayload } from "../../../shared/types/api";
import { dashboardKeys } from "../../dashboard/api/dashboard-hooks";
import { getPlayerProfile, updatePlayerProfile } from "./player-profiles-api";

export const playerProfileKeys = {
  detail: (personId: string) => ["player-profile", personId] as const
};

export function usePlayerProfile(personId: string) {
  return useQuery({
    queryKey: playerProfileKeys.detail(personId),
    queryFn: ({ signal }) => getPlayerProfile(personId, signal),
    enabled: Boolean(personId)
  });
}

export function useUpdatePlayerProfileMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePlayerProfilePayload) => updatePlayerProfile(personId, payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(playerProfileKeys.detail(personId), profile);
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
