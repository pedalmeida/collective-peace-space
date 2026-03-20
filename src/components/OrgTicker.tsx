import { motion } from "motion/react";

const organizations = [
  "Meditação pela Paz",
  "Portugal Pela Paz",
  "Adidam Europe",
  "Ananda Marga",
  "BhaktiMarga",
  "Centro de Reiki",
  "Núcleo FCUL",
  "Brahma Kumaris",
  "Art of Living",
  "Sri Chinmoy",
];

export const OrgTicker = () => {
  // Duplicate for seamless loop
  const items = [...organizations, ...organizations];

  return (
    <section className="py-8 md:py-10 overflow-hidden border-b border-border/30">
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground text-center mb-6">
        Organizado por escolas de todo o país
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          className="flex items-center gap-12 md:gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {items.map((name, idx) => (
            <span
              key={idx}
              className="text-sm md:text-base text-muted-foreground/60 font-medium tracking-wide shrink-0"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
