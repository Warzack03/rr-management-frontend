import type { PersonRoleType } from "../../../shared/types/api";

export function formatAssignmentDate(value: string | null) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function getAssignmentPersonName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`;
}

export function getRoleLabel(role: PersonRoleType) {
  switch (role) {
    case "JUGADOR":
      return "Jugador";
    case "ENTRENADOR":
      return "Entrenador";
    case "STAFF":
      return "Staff";
    default:
      return role;
  }
}
