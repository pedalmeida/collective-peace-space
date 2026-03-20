import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, MapPin, Footprints } from "lucide-react";
import { getEventBySlug } from "@/data/events";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? getEventBySlug(slug) : undefined;

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Evento não encontrado.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
            >
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
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm mb-10 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Voltar
              </Link>

              {event.isPast && (
                <span className="inline-block text-xs tracking-widest uppercase text-muted-foreground bg-muted px-3 py-1 rounded-full mb-4">
                  Evento passado
                </span>
              )}

              {!event.isPast && (
                <span className="inline-block text-xs tracking-widest uppercase text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-4">
                  Próximo evento
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 leading-tight">
                {event.location}
              </h1>

              <div className="space-y-4 text-muted-foreground mb-10">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>{event.date}{event.time ? `, ${event.time}` : ""}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4.5 h-4.5 text-accent shrink-0" />
                  <span>{event.location}</span>
                </div>
                {event.walkInfo && (
                  <div className="flex items-center gap-3">
                    <Footprints className="w-4.5 h-4.5 text-accent shrink-0" />
                    <span>{event.walkInfo}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="prose prose-sm max-w-none"
                >
                  <p className="text-foreground/80 leading-relaxed text-base">
                    {event.description}
                  </p>
                </motion.div>
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
