/**
 * Minimale iCal (RFC 5545) generator + parser voor onze sync-flow.
 * We hebben alleen VEVENT met DTSTART;VALUE=DATE en DTEND;VALUE=DATE nodig.
 */

export type OccupiedRange = {
  /** UID die de bron-rij uniek identificeert binnen onze feed */
  uid: string;
  /** ISO date YYYY-MM-DD (inclusief) */
  startDate: string;
  /** ISO date YYYY-MM-DD (exclusief, RFC 5545 convention) */
  endDate: string;
  /** Korte beschrijving — getoond door Airbnb in agenda */
  summary: string;
};

function formatDate(iso: string): string {
  return iso.replace(/-/g, '');
}

function utcStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildICal(opts: {
  prodId: string;
  calendarName: string;
  events: OccupiedRange[];
}): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${opts.prodId}`,
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escape(opts.calendarName)}`,
    'METHOD:PUBLISH',
  ];

  const stamp = utcStamp();
  for (const event of opts.events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${formatDate(event.endDate)}`,
      `SUMMARY:${escape(event.summary)}`,
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  // RFC 5545 vereist CRLF line endings
  return lines.join('\r\n') + '\r\n';
}

/**
 * Lichte parser die VEVENT-blokken extraheert met DTSTART/DTEND als datums.
 * Sufficient voor Airbnb-feeds (RFC-compliant met date-only events).
 */
export type ParsedICalEvent = {
  uid: string | null;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;
  summary: string | null;
};

function unfoldLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const out: string[] = [];
  for (const line of normalized.split('\n')) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      out[out.length - 1] = (out[out.length - 1] ?? '') + line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function parseICalDate(value: string): string | null {
  // Accept YYYYMMDD or YYYYMMDDTHHMMSSZ — strip time component.
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function parseICal(raw: string): ParsedICalEvent[] {
  const lines = unfoldLines(raw);
  const events: ParsedICalEvent[] = [];
  let current: Partial<ParsedICalEvent> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      if (current?.startDate && current.endDate) {
        events.push({
          uid: current.uid ?? null,
          startDate: current.startDate,
          endDate: current.endDate,
          summary: current.summary ?? null,
        });
      }
      current = null;
    } else if (current) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const keyPart = line.slice(0, colonIdx);
      const value = line.slice(colonIdx + 1);
      const keyName = keyPart.split(';')[0];

      if (keyName === 'UID') current.uid = value;
      else if (keyName === 'SUMMARY') current.summary = value;
      else if (keyName === 'DTSTART') {
        const d = parseICalDate(value);
        if (d) current.startDate = d;
      } else if (keyName === 'DTEND') {
        const d = parseICalDate(value);
        if (d) current.endDate = d;
      }
    }
  }

  return events;
}
