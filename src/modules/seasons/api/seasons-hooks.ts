import { useQuery } from "@tanstack/react-query";
import { getActiveSeasons } from "./seasons-api";

export const seasonsKeys = {
  active: ["seasons", "active"] as const
};

export function useActiveSeasons() {
  return useQuery({
    queryKey: seasonsKeys.active,
    queryFn: ({ signal }) => getActiveSeasons(signal)
  });
}
