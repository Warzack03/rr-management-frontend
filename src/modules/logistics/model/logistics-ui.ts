import type {
  LogisticsGarmentCategory,
  LogisticsOrderStatus,
  LogisticsRequestStatus,
  LogisticsStockMovementType,
  PlayerSeasonGarmentType,
  SleeveType
} from "../../../shared/types/api";

export const logisticsApparelSizeOptions = ["2A", "4A", "6A", "8A", "10A", "12A", "XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export const logisticsSocksSizeOptions = ["39-42", "43-45", "46-48"] as const;

export const playerSeasonGarmentTypeOptions: Array<{ value: PlayerSeasonGarmentType; label: string }> = [
  { value: "PLAYER_MATCH_SHIRT", label: "Camiseta partido jugador" },
  { value: "PLAYER_MATCH_SHORTS", label: "Pantalon partido jugador" },
  { value: "TRAINING_SHIRT", label: "Camiseta entreno" },
  { value: "TRAINING_SHORTS", label: "Pantalon entreno" },
  { value: "TRACKSUIT_PANTS", label: "Pantalon chandal" },
  { value: "JACKET", label: "Chaqueta" },
  { value: "SOCKS", label: "Calcetines" },
  { value: "GOALKEEPER_MATCH_SHIRT", label: "Camiseta partido portero" },
  { value: "GOALKEEPER_MATCH_SHORTS", label: "Pantalon partido portero" }
];

export const sleeveTypeOptions: Array<{ value: SleeveType; label: string }> = [
  { value: "SHORT", label: "Corta" },
  { value: "LONG", label: "Larga" }
];

export const logisticsGarmentOptions: Array<{ value: LogisticsGarmentCategory; label: string }> = [
  { value: "MATCH_SHIRT", label: "Camiseta partido" },
  { value: "MATCH_PANTS", label: "Pantalon partido" },
  { value: "MATCH_SOCKS", label: "Medias partido" },
  { value: "TRAINING_SHIRT", label: "Camiseta entreno" },
  { value: "TRAINING_PANTS", label: "Pantalon entreno" },
  { value: "TRACK_JACKET", label: "Chaqueta chandal" },
  { value: "TRACK_PANTS", label: "Pantalon chandal" }
];

export const logisticsRequestStatusOptions: Array<{ value: LogisticsRequestStatus; label: string }> = [
  { value: "PENDING_STOCK", label: "Pendiente stock" },
  { value: "PARTIALLY_RESERVED", label: "Reserva parcial" },
  { value: "RESERVED_FROM_STOCK", label: "Reservado" },
  { value: "DELIVERED", label: "Entregado" }
];

export function getLogisticsGarmentLabel(value: LogisticsGarmentCategory) {
  return logisticsGarmentOptions.find((option) => option.value === value)?.label ?? value;
}

export function getLogisticsRequestStatusLabel(value: LogisticsRequestStatus) {
  return logisticsRequestStatusOptions.find((option) => option.value === value)?.label ?? value;
}

export function getPlayerSeasonGarmentTypeLabel(value: PlayerSeasonGarmentType) {
  return playerSeasonGarmentTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function getSleeveTypeLabel(value: SleeveType | null) {
  if (!value) {
    return "No aplica";
  }
  return sleeveTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function getLogisticsRequestStatusColor(value: LogisticsRequestStatus): "default" | "warning" | "success" {
  switch (value) {
    case "PENDING_STOCK":
      return "warning";
    case "PARTIALLY_RESERVED":
      return "default";
    case "RESERVED_FROM_STOCK":
      return "success";
    case "DELIVERED":
      return "success";
    default:
      return "default";
  }
}

export function getLogisticsMovementLabel(value: LogisticsStockMovementType) {
  switch (value) {
    case "MANUAL_IN":
      return "Entrada manual";
    case "MANUAL_ADJUSTMENT":
      return "Ajuste manual";
    case "RESERVE":
      return "Reserva";
    case "RELEASE":
      return "Liberacion";
    case "ORDER_RECEIPT":
      return "Recepcion pedido";
    case "DELIVERY":
      return "Entrega";
    default:
      return value;
  }
}

export function getLogisticsOrderStatusLabel(value: LogisticsOrderStatus) {
  switch (value) {
    case "DRAFT":
      return "Borrador";
    case "SENT":
      return "Enviado";
    case "PARTIALLY_RECEIVED":
      return "Recibido parcial";
    case "RECEIVED":
      return "Recibido";
    case "CANCELLED":
      return "Cancelado";
    default:
      return value;
  }
}

export function getLogisticsOrderStatusColor(value: LogisticsOrderStatus): "default" | "warning" | "success" {
  switch (value) {
    case "DRAFT":
      return "default";
    case "SENT":
      return "warning";
    case "PARTIALLY_RECEIVED":
      return "warning";
    case "RECEIVED":
      return "success";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
}

export function formatLogisticsCustomization(nameCustomization?: string | null, numberCustomization?: number | null) {
  if (!nameCustomization && !numberCustomization) {
    return null;
  }
  if (nameCustomization && numberCustomization) {
    return `${nameCustomization} / ${numberCustomization}`;
  }
  return nameCustomization ?? String(numberCustomization);
}
