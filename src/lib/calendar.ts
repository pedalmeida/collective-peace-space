import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

export function buildGoogleCalendarUrl(event: Event): string {
  const dateStr = event.date.replace(/-/g, "");
  const timeStr = event.time.replace(/:/g, "").slice(0, 4);
  const start = `${dateStr}T${timeStr}00`;
  const endHour = (parseInt(event.time.slice(0, 2)) + 2)
    .toString()
    .padStart(2, "0");
  const end = `${dateStr}T${endHour}${event.time.slice(3, 5)}00`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    location: event.location,
    details: event.description ?? "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(event: Event): void {
  const dateStr = event.date.replace(/-/g, "");
  const timeStr = event.time.replace(/:/g, "").slice(0, 4);
  const start = `${dateStr}T${timeStr}00`;
  const endHour = (parseInt(event.time.slice(0, 2)) + 2)
    .toString()
    .padStart(2, "0");
  const end = `${dateStr}T${endHour}${event.time.slice(3, 5)}00`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeditaLisboa//Event//PT",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${(event.description ?? "").replace(/\n/g, "\\n")}`,
    `UID:${event.id}@medita-lisboa`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
