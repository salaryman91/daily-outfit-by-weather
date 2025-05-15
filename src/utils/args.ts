export function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 40); // 발표 지연 고려

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const hour = now.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let selected = '0200';

  for (const t of baseTimes) {
    if (hour >= t) selected = `${String(t).padStart(2, '0')}00`;
  }

  return {
    baseDate: `${yyyy}${mm}${dd}`,
    baseTime: selected,
  };
}

export function getRegionFromArgs(): string | null {
  const arg = process.argv.find(arg => arg.startsWith('--region='));
  return arg ? arg.split('=')[1] : null;
}
