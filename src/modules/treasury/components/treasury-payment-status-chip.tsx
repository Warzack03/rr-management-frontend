import {
  CheckCircleRounded,
  PendingActionsRounded,
  WarningAmberRounded
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import type { TreasuryObligationStatus } from "../../../shared/types/api";

type TreasuryPaymentStatusChipProps =
  | {
      overdueAmount?: number;
      pendingAmount: number;
      size?: "small" | "medium";
      variant?: "filled" | "outlined";
    }
  | {
      obligationStatus: TreasuryObligationStatus;
      overdue?: boolean;
      size?: "small" | "medium";
      variant?: "filled" | "outlined";
    };

export function TreasuryPaymentStatusChip(props: TreasuryPaymentStatusChipProps) {
  const size = props.size ?? "small";
  const variant = props.variant ?? "filled";
  const statusInfo = "obligationStatus" in props
    ? getObligationStatusInfo(props.obligationStatus, props.overdue ?? false)
    : getPersonStatusInfo(props.pendingAmount, props.overdueAmount ?? 0);

  return (
    <Chip
      color={statusInfo.color}
      icon={statusInfo.icon}
      label={statusInfo.label}
      size={size}
      variant={variant}
    />
  );
}

function getPersonStatusInfo(pendingAmount: number, overdueAmount: number) {
  if (overdueAmount > 0) {
    return {
      color: "warning" as const,
      icon: <WarningAmberRounded />,
      label: "Vencido"
    };
  }

  if (pendingAmount > 0) {
    return {
      color: "default" as const,
      icon: <PendingActionsRounded />,
      label: "Pendiente"
    };
  }

  return {
    color: "success" as const,
    icon: <CheckCircleRounded />,
    label: "Al dia"
  };
}

function getObligationStatusInfo(status: TreasuryObligationStatus, overdue: boolean) {
  if (overdue && status !== "PAID") {
    return {
      color: "warning" as const,
      icon: <WarningAmberRounded />,
      label: "Vencida"
    };
  }

  if (status === "PAID") {
    return {
      color: "success" as const,
      icon: <CheckCircleRounded />,
      label: "Pagada"
    };
  }

  if (status === "PARTIALLY_PAID") {
    return {
      color: "info" as const,
      icon: <PendingActionsRounded />,
      label: "Parcial"
    };
  }

  return {
    color: "default" as const,
    icon: <PendingActionsRounded />,
    label: "Pendiente"
  };
}
