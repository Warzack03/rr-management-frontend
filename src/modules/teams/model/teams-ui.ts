import type { Team } from "../../../shared/types/api";

export function getTeamBranchLabel(branch: Team["branch"]) {
  return branch === "CAT" ? "CAT" : "MAD";
}

export function getTeamCrestSrc(branch: Team["branch"]) {
  const fileName = branch === "CAT" ? "catalunya.png" : "escudo.png";
  return `${import.meta.env.BASE_URL}assets/brand/${fileName}`;
}
