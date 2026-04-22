import type { MatchPreference, PlayerPosition, TrainingPreference } from "../../../shared/types/api";

export const playerPositionOptions: Array<{ value: PlayerPosition; label: string }> = [
  { value: "PORTERO", label: "Portero" },
  { value: "DEFENSA_CENTRAL", label: "Defensa central" },
  { value: "DEFENSA_LATERAL", label: "Defensa lateral" },
  { value: "CENTROCAMPISTA", label: "Centrocampista" },
  { value: "BANDA", label: "Banda" },
  { value: "DELANTERO", label: "Delantero" }
];

export const trainingPreferenceOptions: Array<{ value: TrainingPreference; label: string }> = [
  { value: "LUNES_Y_MIERCOLES_16_30_18_00", label: "Lunes y Miércoles 16:30-18:00" },
  { value: "MIERCOLES_20_00_21_00_Y_VIERNES_19_00_21_00", label: "Miércoles 20:00-21:00 y Viernes 19:00-21:00" },
  { value: "INDIFERENTE", label: "Indiferente" }
];

export const matchPreferenceOptions: Array<{ value: MatchPreference; label: string }> = [
  { value: "SABADO_TARDE", label: "Sábado tarde" },
  { value: "DOMINGO_MANANA", label: "Domingo mañana" },
  { value: "DOMINGO_TARDE", label: "Domingo tarde" },
  { value: "INDIFERENTE", label: "Indiferente" }
];

export function getPositionLabel(value: PlayerPosition | null) {
  if (!value) {
    return "Sin informar";
  }

  return playerPositionOptions.find((option) => option.value === value)?.label ?? value;
}

export function getTrainingPreferenceLabel(value: TrainingPreference | null) {
  if (!value) {
    return "Sin informar";
  }

  return trainingPreferenceOptions.find((option) => option.value === value)?.label ?? value;
}

export function getMatchPreferenceLabel(value: MatchPreference | null) {
  if (!value) {
    return "Sin informar";
  }

  return matchPreferenceOptions.find((option) => option.value === value)?.label ?? value;
}
