const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

const RTF = new Intl.RelativeTimeFormat('nl-NL', { numeric: 'auto' });

export function formatDistanceToNow(isoDate: string): string {
  const date = new Date(isoDate);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);

  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      const value = Math.round(diffSeconds / seconds);
      return RTF.format(value, unit);
    }
  }
  return RTF.format(diffSeconds, 'second');
}
