import { Reveal } from "./Reveal";
import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";

export const Participate = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="participar" className="section-padding">
      <div className="container max-w-2xl text-center">
        <Reveal>
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            Como participar
          </p>
          <h2 className="text-foreground mb-6">Junta-te a nós</h2>
          <div className="space-y-4 text-muted-foreground mb-10 leading-relaxed">
            <p>
              Acreditamos que a meditação é uma ferramenta poderosa para cultivar paz interior,
              empatia e universalismo — sementes de transformação individual e coletiva.
            </p>
            <p>Praticas ou tens interesse em meditação?</p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>29 Mar 2026 · 14:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Parque Eduardo VII, Lisboa</span>
              </div>
            </div>

            {submitted ? (
              <p className="text-accent font-medium py-4">
                Obrigado! Receberás notificações sobre os próximos eventos. 🪷
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="O teu email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] whitespace-nowrap"
                >
                  Receber notificações
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
