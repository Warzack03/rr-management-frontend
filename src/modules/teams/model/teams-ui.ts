import type { Team } from "../../../shared/types/api";

export function getTeamBranchLabel(branch: Team["branch"]) {
  return branch === "CAT" ? "CAT" : "MAD";
}

export function getTeamCrestSrc(branch: Team["branch"]) {
  return branch === "CAT" ? "/assets/brand/catalunya.png" : "/assets/brand/escudo.png";
}
