import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { TextReveal } from "./TextReveal";
import { CalendarDays, MapPin, Footprints } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <span ref={ref}>
      {inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CountUp target={value} />
        </motion.span>
      ) : (
        "0"
      )}
    </span>
  );
};

const CountUp = ({ target }: { target: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate="visible"
    >
      {(() => {
        // Simple approach: use motion to animate
        return <MotionCounter target={target} />;
      })()}
    </motion.span>
  );
};

const MotionCounter = ({ target }: { target: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  // Animate using requestAnimationFrame
  const startTime = useRef<number | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return <span ref={ref}>{display}</span>;
};

import { useState, useEffect } from "react";

export const NextEvent = () => {
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
            <AnimatedNumber value={29} /> de Março, 2026
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>Sábado, 14:00</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Parque Eduardo VII — Anfiteatro do Jardim Amália Rodrigues</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Footprints className="w-4 h-4" />
              <span>Caminhada pela paz às 14:30</span>
            </div>
          </div>
          <MagneticButton
            href="#"
            className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
          >
            Adicionar ao calendário
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};
