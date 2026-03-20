import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Footprints, Loader2 } from "lucide-react";
import { CalendarDropdown } from "@/components/CalendarDropdown";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;


const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Evento não encontrado.</p>
            <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <section className="section-padding">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to="/#eventos"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm mr-[50px] mb-16 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Voltar
              </Link>

              <span
                className={`inline-block text-xs tracking-widest uppercase px-3 py-1 rounded-full mb-8 ${
                  event.is_past
                    ? "text-muted-foreground bg-muted"
                    : "text-accent bg-accent/10 border border-accent/20"
                }`}
              >
                {event.is_past ? "Evento passado" : "Próximo evento"}
              </span>

              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 leading-tight">
                {event.title}
              </h1>

              <div className="space-y-4 text-muted-foreground mb-10">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>
                    {new Date(event.date).toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    , {event.time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>{event.location}</span>
                </div>
                {event.walk_info && (
                  <div className="flex items-center gap-3">
                    <Footprints className="w-4.5 h-4.5 text-accent shrink-0" />
                    <span>{event.walk_info}</span>
                  </div>
                )}
              </div>

              {event.flyer_url && (
                <img
                  src={event.flyer_url}
                  alt={`Flyer ${event.title}`}
                  className="w-full max-w-md rounded-xl border border-border mb-10"
                />
              )}

              {event.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-10"
                >
                  <p className="text-foreground/80 leading-relaxed text-base">
                    {event.description}
                  </p>
                </motion.div>
              )}

              {!event.is_past && (
                <a
                  href={buildCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
                >
                  Adicionar ao calendário
                </a>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetail;
