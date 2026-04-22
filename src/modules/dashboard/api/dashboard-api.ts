import { httpClient } from "../../../shared/api/http-client";
import type { DashboardSummary, DashboardTeamView } from "../../../shared/types/api";

export function getDashboardSummary(seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<DashboardSummary>(`/dashboard/summary${query}`, { signal });
}

export function getDashboardTeam(teamId: string, seasonId?: number, signal?: AbortSignal) {
  const query = seasonId ? `?seasonId=${seasonId}` : "";
  return httpClient<DashboardTeamView>(`/dashboard/teams/${teamId}${query}`, { signal });
}
