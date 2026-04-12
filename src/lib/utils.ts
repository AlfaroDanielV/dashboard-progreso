/**
 * Parses a date string that may be either MM/DD/YYYY or DD/MM/YYYY
 * (the same ambiguity-resolution logic used in data.ts parseDate)
 * and returns a consistently formatted DD/MM/YYYY string for display.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    let day: number, month: number;
    if (a > 12) {
      // First part can't be a month → DD/MM/YYYY
      day = a; month = b;
    } else if (b > 12) {
      // Second part can't be a month → MM/DD/YYYY
      day = b; month = a;
    } else {
      // Ambiguous → assume DD/MM/YYYY (Costa Rica default)
      day = a; month = b;
    }

    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  }

  // Fallback for ISO strings (e.g. "2025-03-15")
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return dateStr;
}
