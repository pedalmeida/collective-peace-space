import { useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CalendarDays, MapPin, Footprints, Loader2 } from "lucide-react";
import { CalendarDropdown } from "./CalendarDropdown";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const MotionCounter = ({ target }: { target: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const startTime = useRef<number | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return <span ref={ref}>{display}</span>;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <span ref={ref}>
      {inView ? (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <MotionCounter target={value} />
        </motion.span>
      ) : (
        "0"
      )}
    </span>
  );
};

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const day = new Date(event.date).getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center space-y-5 shadow-sm"
    >
      <h3 className="text-foreground text-2xl md:text-3xl font-semibold">
        <AnimatedNumber value={day} /> de{" "}
        {new Date(event.date).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
      </h3>
      <div className="space-y-2.5 text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>
            {new Date(event.date).toLocaleDateString("pt-PT", { weekday: "long" })},{" "}
            {event.time.slice(0, 5)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{event.location}</span>
        </div>
        {event.walk_info && (
          <div className="flex items-center justify-center gap-2">
            <Footprints className="w-4 h-4 shrink-0" />
            <span>{event.walk_info}</span>
          </div>
        )}
      </div>

      {event.flyer_url && (
        <img
          src={event.flyer_url}
          alt={`Flyer ${event.title}`}
          className="w-full rounded-lg border border-border"
        />
      )}

      <CalendarDropdown event={event} />
    </motion.div>
  );
};

export const NextEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_past", false)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="proximo-evento" className="section-padding-sm">
        <div className="container flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section id="proximo-evento" className="section-padding-sm">
      <div className="container">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-sm tracking-widest uppercase text-accent font-medium text-center mb-8"
        >
          {events.length === 1 ? "Próximo evento" : "Próximos eventos"} 📅
        </motion.p>

        <div className={`grid gap-6 max-w-4xl mx-auto ${events.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
