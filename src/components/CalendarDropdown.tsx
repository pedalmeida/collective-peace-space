import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";

type Event = Tables<"events">;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const OutlookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

interface CalendarDropdownProps {
  event: Event;
  className?: string;
}

export const CalendarDropdown = ({ event, className }: CalendarDropdownProps) => {
  const [open, setOpen] = useState(false);

  const options = [
    {
      label: "Google Calendar",
      icon: <GoogleIcon />,
      action: () => window.open(buildGoogleCalendarUrl(event), "_blank"),
    },
    {
      label: "Apple Calendar",
      icon: <AppleIcon />,
      action: () => downloadIcsFile(event),
    },
    {
      label: "Outlook",
      icon: <OutlookIcon />,
      action: () => downloadIcsFile(event),
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={
            className ??
            "inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
          }
        >
          <CalendarDays className="w-4 h-4" />
          Adicionar ao calendário
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="center" sideOffset={8}>
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => {
              opt.action();
              setOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors duration-150 active:scale-[0.98]"
          >
            <span className="text-muted-foreground">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
