import { Reveal } from "./Reveal";
import { CalendarDays, MapPin, Footprints } from "lucide-react";

export const NextEvent = () => {
  return (
    <section id="proximo-evento" className="section-padding-sm">
      <div className="container">
        <Reveal>
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 max-w-2xl mx-auto text-center space-y-6 shadow-sm">
            <p className="text-sm tracking-widest uppercase text-accent font-medium">
              Próximo evento
            </p>
            <h2 className="text-foreground">29 de Março, 2026</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>Sábado, 14:00</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Parque Eduardo VII — Anfiteatro do Jardim Amália Rodrigues</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Footprints className="w-4 h-4" />
                <span>Caminhada pela paz às 14:30</span>
              </div>
            </div>
            <a
              href="#"
              className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
            >
              Adicionar ao calendário
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
