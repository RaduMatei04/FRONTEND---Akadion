export type DateTimeTimeStyle = "short" | "medium"

export function formatDateTime(value: unknown, timeStyle: DateTimeTimeStyle = "short") {
  if (!value) {
    return "-"
  }

  const dateValue = typeof value === "string" || typeof value === "number" || value instanceof Date ? value : ""
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle,
  }).format(date)
}

export function formatDateTimeParts(value: unknown, timeStyle: DateTimeTimeStyle = "short") {
  const formatted = formatDateTime(value, timeStyle)
  if (formatted === "-" || !formatted.includes(",")) {
    return { date: formatted, time: "" }
  }

  const [datePart, timePart] = formatted.split(",")
  return {
    date: datePart.trim(),
    time: timePart.trim(),
  }
}
