import { MagneticButton } from "./MagneticButton";
import { FloatingDots } from "./FloatingDots";
import { TextReveal } from "./TextReveal";
import { CalendarDays, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Participate = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    const { error } = await supabase.from("subscribers").insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        setStatus("duplicate");
      } else {
        setStatus("idle");
        toast.error("Algo correu mal. Tenta novamente.");
      }
    } else {
      setStatus("success");
    }
  };

  return (
    <section id="participar" className="section-padding relative overflow-hidden">
      <FloatingDots />
      <div className="container max-w-2xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            Como participar
          </p>
          <TextReveal className="text-foreground mb-6" delay={0.1}>
            Junta-te a nós
          </TextReveal>
          <div className="space-y-4 text-muted-foreground mb-10 leading-relaxed">
            <p>
              Acreditamos que a meditação é uma ferramenta poderosa para cultivar paz interior,
              empatia e universalismo — sementes de transformação individual e coletiva.
            </p>
            <p>Praticas ou tens interesse em meditação?</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm"
        >
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

          {status === "success" ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-accent font-medium py-4"
            >
              Obrigado! Receberás notificações sobre os próximos eventos. 🪷
            </motion.p>
          ) : status === "duplicate" ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-accent font-medium py-4"
            >
              Já temos o teu email! Receberás as novidades. 🪷
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu email"
                required
                disabled={status === "loading"}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50"
              />
              <MagneticButton
                as="button"
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] whitespace-nowrap disabled:opacity-50"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A enviar...
                  </span>
                ) : (
                  "Receber informações dos eventos"
                )}
              </MagneticButton>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
