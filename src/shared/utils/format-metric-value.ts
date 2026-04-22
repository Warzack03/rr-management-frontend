export function formatMetricValue(value: number | null | undefined) {
  if (value == null) {
    return "--";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
