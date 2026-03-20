import { Reveal } from "./Reveal";
import { Heart, Leaf, Globe, Sparkles } from "lucide-react";

const values = [
  { icon: Heart, text: "Com paz e cooperação" },
  { icon: Leaf, text: "Com harmonia com a natureza" },
  { icon: Globe, text: "Com respeito por todas as culturas e pessoas" },
  { icon: Sparkles, text: "Com ação ética e consciente" },
];

export const Mission = () => {
  return (
    <section id="missao" className="section-padding bg-card">
      <div className="container max-w-3xl text-center">
        <Reveal>
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            A nossa missão
          </p>
          <h2 className="text-foreground mb-12">
            Um mundo construído…
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="flex items-center gap-4 p-6 rounded-xl bg-background border border-border text-left">
                <v.icon className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-foreground font-light">{v.text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
