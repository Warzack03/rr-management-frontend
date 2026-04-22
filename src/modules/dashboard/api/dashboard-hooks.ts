import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getDashboardTeam } from "./dashboard-api";

export const dashboardKeys = {
  summary: (seasonId?: number) => ["dashboard", "summary", seasonId ?? "current"] as const,
  team: (teamId: string, seasonId?: number) => ["dashboard", "team", teamId, seasonId ?? "current"] as const
};

export function useDashboardSummary(seasonId?: number) {
  return useQuery({
    queryKey: dashboardKeys.summary(seasonId),
    queryFn: ({ signal }) => getDashboardSummary(seasonId, signal)
  });
}

export function useDashboardTeam(teamId: string, seasonId?: number) {
  return useQuery({
    queryKey: dashboardKeys.team(teamId, seasonId),
    queryFn: ({ signal }) => getDashboardTeam(teamId, seasonId, signal),
    enabled: Boolean(teamId)
  });
}
