

/**
 * Converts a Date or timestamp string into a relative "time ago" string:
 * e.g. "1s ago", "5m ago", "2h ago", "3d ago", "4mo ago", "1y ago"
 */
export function timeAgo(input: Date | string): string {
    const now = new Date();
    const past = typeof input === 'string' ? new Date(input) : input;
    const diffMs = now.getTime() - past.getTime();
  
    if (diffMs < 0) {
      return 'just now';
    }
  
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
    const months  = Math.floor(days / 30);
    const years   = Math.floor(days / 365);
  
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    if (days < 30) {
      return `${days}d ago`;
    }
    if (months < 12) {
      return `${months}mo ago`;
    }
    return `${years}y ago`;
  }
  