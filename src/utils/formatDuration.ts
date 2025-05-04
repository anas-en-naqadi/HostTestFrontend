
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const hoursStr = hours > 0 ? `${hours} hrs` : "";
    const minutesStr = minutes > 0 ? `${minutes} min` : "";

    return `${hoursStr} ${minutesStr}`.trim();
  }