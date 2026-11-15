export function formatPlannedTime(isoString?: string | null): string {
  if (!isoString) return "TBD";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const diffMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60));

  if (Math.abs(diffMinutes) <= 10) {
    return "Right Now 🔥";
  }

  const timeFormatted = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday ? `Today at ${timeFormatted}` : timeFormatted;
}

export function formatShortTime(isoString?: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const diffMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
  if (Math.abs(diffMinutes) <= 10) {
    return "NOW 🔥";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function addMinutesToIso(isoString: string, minutes: number): string {
  const base = new Date(isoString);
  const validBase = isNaN(base.getTime()) ? new Date() : base;
  return new Date(validBase.getTime() + minutes * 60 * 1000).toISOString();
}

export function timeStringToTodayIso(timeHHMM: string): string {
  const [hoursStr, minutesStr] = timeHHMM.split(":");
  const d = new Date();
  d.setHours(
    parseInt(hoursStr || "17", 10),
    parseInt(minutesStr || "0", 10),
    0,
    0
  );
  return d.toISOString();
}
