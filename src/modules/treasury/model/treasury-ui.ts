import type {
  TreasuryConceptCode,
  TreasuryObligationStatus,
  TreasuryPaymentMethod,
  TreasuryPlayerCondition
} from "../../../shared/types/api";

export const treasuryStatusOptions = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Con pendiente" },
  { value: "OVERDUE", label: "Vencidos" },
  { value: "UP_TO_DATE", label: "Al dia" }
] as const;

export const treasuryConditionOptions = [
  { value: "ALL", label: "Todas" },
  { value: "NEW", label: "Nuevo" },
  { value: "RETURNING", label: "Renovado" }
] as const;

export function getTreasuryPlayerConditionLabel(value: TreasuryPlayerCondition) {
  switch (value) {
    case "NEW":
      return "Nuevo";
    case "RETURNING":
      return "Renovado";
    default:
      return value;
  }
}

export function getTreasuryConceptLabel(value: TreasuryConceptCode) {
  switch (value) {
    case "FIRST_SEASON_PAYMENT":
      return "Primer pago";
    case "SECOND_SEASON_PAYMENT":
      return "Segundo pago";
    case "EXTRA_EQUIPMENT":
      return "Extra equipacion";
    default:
      return value;
  }
}

export function getTreasuryPaymentMethodLabel(value: TreasuryPaymentMethod) {
  switch (value) {
    case "CASH":
      return "Efectivo";
    case "TRANSFER":
      return "Transferencia";
    case "BIZUM":
      return "Bizum";
    default:
      return value;
  }
}

export function getTreasuryObligationStatusLabel(value: TreasuryObligationStatus) {
  switch (value) {
    case "OPEN":
      return "Abierta";
    case "PARTIALLY_PAID":
      return "Parcial";
    case "PAID":
      return "Pagada";
    default:
      return value;
  }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}
