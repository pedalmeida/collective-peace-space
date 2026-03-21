import { motion } from "motion/react";
import { MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "./TextReveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const itemVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -20 : 20,
    filter: "blur(3px)",
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: 0.1 + i * 0.08,
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

      <div className="container max-w-2xl">
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
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {events.map((event, i) => (
              <motion.div key={event.id} custom={i} variants={itemVariants}>
                <Link
                  to={`/evento/${event.slug}`}
                  className="flex items-center justify-between p-5 rounded-xl bg-background border border-border hover:shadow-md transition-shadow duration-300 cursor-pointer group"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-accent transition-colors duration-200 text-sm">
                    Ver →
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
