const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;  // Add this line
const YEAR   = 365 * DAY;   // Adjust YEAR to use DAY

type TimeInput = Date | string | number;

/**
 * Returns a human-friendly “X unit ago” string,
 * using years, days, hours, minutes, or seconds.
 */
export function formatTimeAgo(input: TimeInput): string {
  // 1) Normalize input to UNIX timestamp (seconds)
  const then = 
    typeof input === "number"
      ? input
      : typeof input === "string"
        ? Date.parse(input)
        : input.getTime();

  // 2) Compute delta in seconds
  const deltaSec = Math.floor((Date.now() - then) / 1000);
  if (deltaSec < 1) return "just now";

  // 3) Choose the largest unit
  const [value, unit] =
    deltaSec >= YEAR   ? [Math.floor(deltaSec / YEAR),   "year"]   :
    deltaSec >= DAY    ? [Math.floor(deltaSec / DAY),    "day"]    :  // Add check for days
    deltaSec >= HOUR   ? [Math.floor(deltaSec / HOUR),   "hour"]   :
    deltaSec >= MINUTE ? [Math.floor(deltaSec / MINUTE), "minute"] :
                         [deltaSec,                     "second"];

  // 4) Pluralize and return
  return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
}
