import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ── Organic breathing line (below heading) ── */
export const OrganicLine = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]" aria-hidden>
    <svg
      viewBox="0 0 800 400"
      className="absolute w-[120%] h-[60%] -left-[10%] bottom-0 opacity-20"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,200 C100,100 200,300 350,180 C500,60 600,280 800,200"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 },
          opacity: { duration: 1 },
        }}
      />
      <motion.path
        d="M0,260 C150,180 250,340 400,240 C550,140 700,300 800,250"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{
          pathLength: { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5, delay: 0.8 },
          opacity: { duration: 1.5, delay: 0.8 },
        }}
      />
    </svg>
  </div>
);

/* ── Text highlight for "mundo melhor" ── */
export const TextHighlight = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <span ref={ref} className="relative inline-block">
      <motion.span
        className="absolute bottom-1 left-0 w-full h-[35%] bg-accent/20 rounded-sm -z-10 origin-left"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      mundo melhor.
    </span>
  );
};
