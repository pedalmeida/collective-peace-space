import { motion } from "motion/react";
import orgBhaktiMarga from "@/assets/org-bhaktimarga.png";
import orgAnandaMarga from "@/assets/org-anandamarga.png";
import orgFcul from "@/assets/org-fcul.png";
import orgPadmaYoga from "@/assets/org-padmayoga.png";
import orgAdiram from "@/assets/org-adiram.png";
import orgCentroReiki from "@/assets/org-centro-reiki.png";
import orgIrbyCenter from "@/assets/org-irby-center.png";
import orgYogaCoracao from "@/assets/org-yoga-coracao.png";

const organizations = [
  { name: "Bhakti Marga", logo: orgBhaktiMarga },
  { name: "Ananda Marga", logo: orgAnandaMarga },
  { name: "Núcleo Meditação FCUL", logo: orgFcul },
  { name: "Padma Yoga", logo: orgPadmaYoga },
  { name: "Adiram Europe", logo: orgAdiram },
  { name: "Centro de Reiki e Meditação Clássica", logo: orgCentroReiki },
  { name: "IRBY-Center", logo: orgIrbyCenter },
  { name: "Yoga na Linha do Coração", logo: orgYogaCoracao },
];

export const OrgTicker = () => {
  const items = [...organizations, ...organizations, ...organizations];

  return (
    <section className="pt-3 pb-8 md:pt-4 md:pb-10 overflow-hidden border-b border-border/30 relative z-10">
      <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground text-center mb-12 md:mb-14">
        COM O APOIO DAS SEGUINTES ORGANIZAÇÕES:
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          className="flex items-center gap-16 md:gap-24 whitespace-nowrap"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {items.map((org, idx) => (
            <img
              key={idx}
              src={org.logo}
              alt={org.name}
              className="h-8 md:h-10 w-auto shrink-0 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
