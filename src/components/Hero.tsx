import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import meditationGlobe from "@/assets/meditation-globe.jpg";
import meditationGroup from "@/assets/meditation-group-real.jpg";
import meditationCircle from "@/assets/meditation-circle-real.jpg";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";
import { FloatingDots } from "./FloatingDots";
import { AnimatedImage } from "./AnimatedImage";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imgY1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const imgY2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const imgY3 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={sectionRef} className="section-padding pb-8 md:pb-12 relative">
      <FloatingDots />
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <div className="space-y-6">
              <p className="text-sm tracking-widest uppercase text-accent-foreground/70 font-medium">
                ◆ EVENTO MENSAL DE MEDITAÇÃO COLETIVA
              </p>
              <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                <span className="font-sans font-light">Meditar por um</span>
                <br />
                <span className="font-serif italic">mundo melhor.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Um espaço para parar, respirar e criar mudança, juntos.
              </p>
              <MagneticButton
                href="#proximo-evento"
                className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
              >
                Junta-te ao próximo evento
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid grid-cols-5 grid-rows-4 gap-3 h-[420px] md:h-[480px]">
              <motion.div style={{ y: imgY1 }} className="col-span-2 row-span-4 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={meditationGlobe}
                  alt="Mão a segurar um globo terrestre durante meditação"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </motion.div>
              <motion.div style={{ y: imgY2 }} className="col-span-3 row-span-2 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={meditationGroup}
                  alt="Grupo de pessoas a meditar num parque"
                  className="w-full h-full object-cover"
                  delay={0.1}
                />
              </motion.div>
              <motion.div style={{ y: imgY3 }} className="col-span-3 row-span-2 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={meditationCircle}
                  alt="Círculo de meditação ao ar livre em Lisboa"
                  className="w-full h-full object-cover"
                  delay={0.2}
                />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
