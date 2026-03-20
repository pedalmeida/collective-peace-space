import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";
import { motion } from "motion/react";
import meditationGlobe from "@/assets/meditation-globe.jpg";

export const About = () => {
  return (
    <section id="sobre" className="section-padding relative">
      {/* Gradient accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden aspect-[4/3]"
          >
            <img
              src={meditationGlobe}
              alt="Mão a segurar um globo terrestre durante meditação"
              className="w-full h-full object-cover object-bottom"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="space-y-6"
          >
            <p className="text-sm tracking-widest uppercase text-accent font-medium">
              O que é o evento
            </p>
            <TextReveal className="text-foreground" delay={0.2}>
              Meditar por um mundo melhor
            </TextReveal>
            <p className="text-sm text-muted-foreground italic">
              Chegar ao coletivo através do desenvolvimento individual, através da paz interior
            </p>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A meditação é uma prática simples e acessível que nos ajuda a acalmar a mente
                e cultivar presença no dia-a-dia. Ao criar este espaço interior, desenvolvemos
                paz, clareza e equilíbrio emocional.
              </p>
              <p>
                Com a prática regular, desperta-se uma maior empatia pelos outros e um sentimento
                de universalismo — a consciência de que fazemos parte de uma mesma humanidade.
              </p>
              <p>
                Assim, quando feita à escala, contribui para uma mudança positiva e coletiva no mundo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
