import { useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { TextReveal } from "./TextReveal";
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

export const NextEvent = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_past", false)
      .order("date", { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        setEvent(data);
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

  if (!event) return null;

  const day = new Date(event.date).getDate();

  return (
    <section id="proximo-evento" className="section-padding-sm">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-border rounded-2xl p-8 md:p-12 max-w-2xl mx-auto text-center space-y-6 shadow-sm"
        >
          <p className="text-sm tracking-widest uppercase text-accent font-medium">
            Próximo evento
          </p>
          <h2 className="text-foreground">
            <AnimatedNumber value={day} /> de{" "}
            {new Date(event.date).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleDateString("pt-PT", { weekday: "long" })},{" "}
                {event.time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            {event.walk_info && (
              <div className="flex items-center justify-center gap-2">
                <Footprints className="w-4 h-4" />
                <span>{event.walk_info}</span>
              </div>
            )}
          </div>

          {event.flyer_url && (
            <img
              src={event.flyer_url}
              alt={`Flyer ${event.title}`}
              className="w-full max-w-sm mx-auto rounded-lg border border-border"
            />
          )}

          <CalendarDropdown event={event} />
        </motion.div>
      </div>
    </section>
  );
};
