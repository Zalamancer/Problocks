/** Returns human-readable relative time: "just now", "2m ago", "3h ago",
 *  "5d ago", or the short date for older entries. Zero dependencies. */
export function formatRelativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  if (ms < 0) return 'just now';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
