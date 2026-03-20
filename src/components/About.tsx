import { Reveal } from "./Reveal";
import meditationGlobe from "@/assets/meditation-globe.jpg";

export const About = () => {
  return (
    <section id="sobre" className="section-padding">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                  src={meditationGlobe}
                  alt="Mão a segurar um globo terrestre durante meditação"
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="space-y-6">
              <p className="text-sm tracking-widest uppercase text-accent font-medium">
                O que é o evento
              </p>
              <h2 className="text-foreground">
                Meditar por um mundo melhor
              </h2>
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
