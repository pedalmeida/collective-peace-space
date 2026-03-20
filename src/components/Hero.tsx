import meditationGroup from "@/assets/meditation-group-1.jpg";
import meditationPortrait from "@/assets/meditation-portrait.jpg";
import meditationCircle from "@/assets/meditation-circle.jpg";
import { Reveal } from "./Reveal";

export const Hero = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text */}
          <Reveal>
            <div className="space-y-6">
              <p className="text-sm tracking-widest uppercase text-muted-foreground">
                Evento mensal · Lisboa
              </p>
              <h1 className="text-foreground">
                Meditar por um<br />mundo melhor
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Evento mensal de meditação coletiva. Um espaço para respirar, juntos.
              </p>
              <a
                href="#proximo-evento"
                className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
              >
                Junta-te ao próximo evento
              </a>
            </div>
          </Reveal>

          {/* Editorial image grid */}
          <Reveal delay={1}>
            <div className="grid grid-cols-5 grid-rows-4 gap-3 h-[420px] md:h-[480px]">
              <div className="col-span-3 row-span-4 rounded-xl overflow-hidden">
                <img
                  src={meditationGroup}
                  alt="Grupo de pessoas a meditar num parque ao pôr do sol"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="col-span-2 row-span-2 rounded-xl overflow-hidden">
                <img
                  src={meditationPortrait}
                  alt="Retrato sereno de pessoa em meditação"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-2 row-span-2 rounded-xl overflow-hidden">
                <img
                  src={meditationCircle}
                  alt="Círculo de meditação num jardim"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
