import type { DocumentStatus, DocumentType, PersonRoleType } from "../../../shared/types/api";

export const documentTypeOptions: Array<{ value: DocumentType; label: string }> = [
  { value: "DNI", label: "DNI" },
  { value: "NIE", label: "NIE" },
  { value: "PASAPORTE", label: "Pasaporte" }
];

export const documentStatusOptions: Array<{ value: DocumentStatus; label: string }> = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "COMPLETO", label: "Completo" },
  { value: "NO_APLICA", label: "No aplica" }
];

export const personRoleOptions: Array<{ value: PersonRoleType; label: string }> = [
  { value: "JUGADOR", label: "Jugador" },
  { value: "ENTRENADOR", label: "Entrenador" },
  { value: "STAFF", label: "Staff" }
];

export function getPersonRoleLabel(role: PersonRoleType) {
  return personRoleOptions.find((option) => option.value === role)?.label ?? role;
}

export function getDocumentTypeLabel(type: DocumentType) {
  return documentTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function getDocumentStatusLabel(status: DocumentStatus | null) {
  if (!status) {
    return "Sin definir";
  }

  return documentStatusOptions.find((option) => option.value === status)?.label ?? status;
}
