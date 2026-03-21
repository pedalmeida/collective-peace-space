import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import heroGlobe from "@/assets/hero-globe.webp";
import meditationGroup from "@/assets/meditation-group-real.webp";
import meditationCircle from "@/assets/meditation-circle-real.webp";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";
import { FloatingDots } from "./FloatingDots";
import { AnimatedImage } from "./AnimatedImage";
import { OrganicLine, TextHighlight } from "./HeroVisualVariant";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const imgY1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const imgY2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const imgY3 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={sectionRef} className="pt-4 md:pt-6 lg:section-padding pb-2 md:pb-3 relative py-[60px]">
      <FloatingDots />
      <OrganicLine />
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <div className="space-y-6">
              <span className="inline-block text-[0.8rem] tracking-widest uppercase font-medium border-accent/30 rounded-full px-4 py-1.5 text-accent bg-destructive-foreground border-2">
                ◆ EVENTO MENSAL DE MEDITAÇÃO COLETIVA
              </span>
              <h1 className="text-foreground text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                <span className="font-sans font-light">Meditar por um</span>
                <br />
                <span className="font-serif italic">
                  <TextHighlight />
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Um espaço para parar, respirar e criar mudança, juntos.
              </p>
              <MagneticButton
                href="#proximo-evento"
                className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]">
                Junta-te a nós
                <span className="inline-flex items-center justify-center w-5 h-5 bg-white/90 rounded-full ml-2">
                  <ArrowRight className="w-3 h-3 text-primary" />
                </span>
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="grid grid-cols-5 grid-rows-4 gap-3 h-[420px] md:h-[480px]">
              <motion.div style={{ y: imgY1 }} className="col-span-2 row-span-4 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={heroGlobe}
                  alt="Mão a segurar um globo terrestre durante meditação"
                  className="w-full h-full object-cover"
                  loading="eager" />
              </motion.div>
              <motion.div style={{ y: imgY2 }} className="col-span-3 row-span-2 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={meditationGroup}
                  alt="Grupo de pessoas a meditar num parque"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  delay={0.1} />
              </motion.div>
              <motion.div style={{ y: imgY3 }} className="col-span-3 row-span-2 rounded-xl overflow-hidden">
                <AnimatedImage
                  src={meditationCircle}
                  alt="Círculo de meditação ao ar livre em Lisboa"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  delay={0.2} />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
