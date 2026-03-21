import { TextReveal } from "./TextReveal";
import { motion } from "motion/react";
import { Heart, Leaf, Globe, Sparkles } from "lucide-react";

const values = [
{ icon: Heart, text: "Com paz e cooperação" },
{ icon: Leaf, text: "Com harmonia com a natureza" },
{ icon: Globe, text: "Com respeito por todas as culturas e pessoas" },
{ icon: Sparkles, text: "Com ação ética e consciente" }];


const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -30 : 30,
    filter: "blur(4px)"
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: 0.15 + i * 0.1
    }
  })
};

export const Mission = () => {
  return (
    <section id="missao" className="section-padding bg-card relative py-[50px]">
      {/* Gradient accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="container max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}>
          
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            A nossa missão 🌍
          </p>
          <TextReveal className="text-foreground mb-12" delay={0.1}>
            Um mundo construído…
          </TextReveal>
        </motion.div>
        <motion.div
          className="grid sm:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}>
          
          {values.map((v, i) =>
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            className="flex items-center gap-4 p-6 rounded-xl bg-background border border-border text-left hover:shadow-md transition-shadow duration-300">
            
              <v.icon className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-foreground font-light">{v.text}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>);

};