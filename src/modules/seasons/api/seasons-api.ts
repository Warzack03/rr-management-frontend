import { httpClient } from "../../../shared/api/http-client";
import type { Season } from "../../../shared/types/api";

export function getActiveSeasons(signal?: AbortSignal) {
  return httpClient<Season[]>("/seasons", { signal });
}
