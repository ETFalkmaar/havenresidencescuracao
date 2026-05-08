// Minimal RFC-5545 parser tailored to Airbnb's "Reserved" iCal feeds.
// Handles unfolded multi-line content, basic escaping in SUMMARY/DESCRIPTION,
// and DTSTART/DTEND in either VALUE=DATE or full timestamp form.

export type ICalEvent = {
  uid: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (exclusive, like iCal)
  summary: string | null;
};

/** Unfold long lines per RFC 5545 §3.1 (lines starting with space/tab continue). */
function unfold(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function parseDateValue(value: string): string | null {
  // VALUE=DATE: 20260512 → 2026-05-12
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Take "DTSTART;VALUE=DATE:20260512" or "DTSTART:20260512T120000Z" and return YYYY-MM-DD. */
function readDate(line: string): string | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  return parseDateValue(line.slice(colon + 1).trim());
}

function unescapeIcal(s: string): string {
  return s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

export function parseICal(text: string): ICalEvent[] {
  const lines = unfold(text);
  const events: ICalEvent[] = [];
  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      if (current.uid && current.startDate && current.endDate) {
        events.push({
          uid: current.uid,
          startDate: current.startDate,
          endDate: current.endDate,
          summary: current.summary ?? null,
        });
      }
      current = {};
      continue;
    }
    if (!inEvent) continue;

    if (line.startsWith("UID:")) {
      current.uid = line.slice(4).trim();
    } else if (line.startsWith("DTSTART")) {
      const v = readDate(line);
      if (v) current.startDate = v;
    } else if (line.startsWith("DTEND")) {
      const v = readDate(line);
      if (v) current.endDate = v;
    } else if (line.startsWith("SUMMARY:")) {
      current.summary = unescapeIcal(line.slice(8).trim());
    }
  }

  return events;
}
