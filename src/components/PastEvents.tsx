import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "./TextReveal";
import { pastEvents } from "@/data/events";

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
            Eventos passados
          </p>
          <TextReveal className="text-foreground" delay={0.1}>
            Onde já estivemos
          </TextReveal>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {pastEvents.map((event, i) => (
            <motion.div
              key={event.slug}
              custom={i}
              variants={itemVariants}
            >
              <Link
                to={`/evento/${event.slug}`}
                className="flex items-center justify-between p-5 rounded-xl bg-background border border-border hover:shadow-md transition-shadow duration-300 cursor-pointer group"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">{event.date}</p>
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
      </div>
    </section>
  );
};
