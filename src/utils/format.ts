export function formatDuration(ms: number): string {
  if (ms === 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function createProgressBar(current: number, total: number, size = 15): string {
  if (total === 0) return '░'.repeat(size);
  const progress = Math.min(Math.max(current / total, 0), 1);
  const filledBars = Math.round(progress * size);
  const emptyBars = size - filledBars;

  return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
}
