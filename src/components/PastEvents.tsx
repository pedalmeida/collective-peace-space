import { Reveal } from "./Reveal";
import { MapPin } from "lucide-react";

const pastEvents = [
  { date: "Sábado, 25 de Outubro 2025", location: "Jardins da Torre de Belém" },
  { date: "Domingo, 30 de Novembro 2025", location: "Pavilhão de Portugal" },
  { date: "Sábado, 20 de Dezembro 2025", location: "Jardim Botânico de Lisboa" },
  { date: "Domingo, 25 de Janeiro 2026", location: "Parque das Nações" },
  { date: "Sábado, 28 de Fevereiro 2026", location: "Jardim da Estrela" },
];

export const PastEvents = () => {
  return (
    <section id="eventos" className="section-padding bg-card">
      <div className="container max-w-2xl">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
              Eventos passados
            </p>
            <h2 className="text-foreground">Onde já estivemos</h2>
          </div>
        </Reveal>

        <div className="space-y-4">
          {pastEvents.map((event, i) => (
            <Reveal key={i} delay={Math.min(i + 1, 4)}>
              <div className="flex items-center justify-between p-5 rounded-xl bg-background border border-border hover:shadow-sm transition-shadow duration-200 cursor-pointer group">
                <div>
                  <p className="text-foreground text-sm font-medium">{event.date}</p>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className="text-muted-foreground group-hover:text-accent transition-colors duration-200 text-sm">
                  Ver →
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
