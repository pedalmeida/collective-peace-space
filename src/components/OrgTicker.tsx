import { useMemo } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback data using local assets
import orgBhaktiMarga from "@/assets/org-bhaktimarga.png";
import orgAnandaMarga from "@/assets/org-anandamarga.png";
import orgFcul from "@/assets/org-fcul.png";
import orgPadmaYoga from "@/assets/org-padmayoga.png";
import orgAdiram from "@/assets/org-adiram.png";
import orgCentroReiki from "@/assets/org-centro-reiki.png";
import orgIrbyCenter from "@/assets/org-irby-center.png";
import orgYogaCoracao from "@/assets/org-yoga-coracao.png";

const fallbackOrgs = [
  { name: "Bhakti Marga", logo: orgBhaktiMarga, url: "https://www.bhaktimarga.org" },
  { name: "Ananda Marga", logo: orgAnandaMarga, url: "https://www.anandamarga.org" },
  { name: "Núcleo Meditação FCUL", logo: orgFcul, url: "https://ciencias.ulisboa.pt" },
  { name: "Padma Yoga", logo: orgPadmaYoga, url: "https://www.padmayoga.pt" },
  { name: "Adiram Europe", logo: orgAdiram, url: "https://www.adiram.net" },
  { name: "Centro de Reiki e Meditação Clássica", logo: orgCentroReiki, url: "https://www.centroreiki.pt" },
  { name: "IRBY-Center", logo: orgIrbyCenter, url: "https://www.irby-center.com" },
  { name: "Yoga na Linha do Coração", logo: orgYogaCoracao, url: "https://www.yoganalinhadocoracao.pt" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const OrgTicker = () => {
  const { data: dbOrgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const organizations = useMemo(() => {
    if (dbOrgs && dbOrgs.length > 0) {
      return shuffle(
        dbOrgs.map((o) => ({
          name: o.name,
          logo: o.logo_url,
          url: o.website_url,
        }))
      );
    }
    return shuffle(fallbackOrgs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbOrgs]);

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
          className="flex items-center gap-10 md:gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 10,
              ease: "linear",
            },
          }}
        >
          {items.map((org, idx) => {
            const img = (
              <img
                src={org.logo}
                alt={org.name}
                className="h-8 md:h-10 w-auto shrink-0 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              />
            );
            return org.url ? (
              <a
                key={idx}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {img}
              </a>
            ) : (
              <span key={idx} className="shrink-0">{img}</span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
