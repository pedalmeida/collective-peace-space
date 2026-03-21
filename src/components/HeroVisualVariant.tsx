import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Aurora from "./Aurora";

/* ── Variant A — Organic breathing line ── */
const OrganicLine = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <svg
      viewBox="0 0 800 400"
      className="absolute w-[120%] h-full -left-[10%] top-0 opacity-[0.12]"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,200 C100,100 200,300 350,180 C500,60 600,280 800,200"
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2.5"
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
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{
          pathLength: { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5, delay: 0.8 },
          opacity: { duration: 1.5, delay: 0.8 },
        }}
      />
    </svg>
  </div>
);

/* ── Variant B — Aurora glow ── */
const AuroraGlow = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20" aria-hidden>
    <Aurora
      colorStops={["#E6B86A", "#8B9E6B", "#D4A855"]}
      amplitude={0.8}
      blend={0.6}
      speed={0.4}
    />
  </div>
);

/* ── Variant C — Text highlight ── */
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

/* ── Switcher container ── */
type Variant = "A" | "B" | "C";

interface HeroVisualVariantProps {
  variant: Variant;
}

export const HeroVisualVariant = ({ variant }: HeroVisualVariantProps) => {
  if (variant === "A") return <OrganicLine />;
  if (variant === "B") return <AuroraGlow />;
  return null; // C is inline in text
};

/* ── Variant selector (temporary, remove after choosing) ── */
export const VariantSelector = ({
  current,
  onChange,
}: {
  current: Variant;
  onChange: (v: Variant) => void;
}) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
    {(["A", "B", "C"] as Variant[]).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          current === v
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {v === "A" ? "Linha" : v === "B" ? "Aurora" : "Highlight"}
      </button>
    ))}
  </div>
);
