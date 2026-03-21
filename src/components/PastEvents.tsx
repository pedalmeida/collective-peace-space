import { motion } from "motion/react";
import { MapPin, Calendar, ImageOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "./TextReveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: 0.1 + i * 0.1,
    },
  }),
};

export const PastEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_past", true)
      .order("date", { ascending: false })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="eventos" className="section-padding bg-card relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            Eventos passados 📸
          </p>
          <TextReveal className="text-foreground" delay={0.1}>
            Onde já estivemos
          </TextReveal>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-10">Nenhum evento passado.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {events.map((event, i) => (
              <motion.div key={event.id} custom={i} variants={cardVariants} className="w-full max-w-[200px]">
                <Link
                  to={`/evento/${event.slug}`}
                  className="block rounded-xl bg-background border border-border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {event.flyer_url ? (
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={event.flyer_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                      <ImageOff className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  )}

                  <div className="p-3 space-y-1.5">
                    <p className="text-foreground font-medium text-xs">{event.title}</p>
                    <div className="flex flex-col gap-0.5 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {format(parseISO(event.date), "d 'de' MMMM yyyy", { locale: pt })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};