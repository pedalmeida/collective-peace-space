import { FloatingDots } from "./FloatingDots";
import { TextReveal } from "./TextReveal";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Participate = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [wantsToOrganize, setWantsToOrganize] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const { data, error } = await supabase.functions.invoke("add-subscriber", {
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          comments: comments.trim() || null,
          wants_to_organize: wantsToOrganize
        }
      });

      if (error) {
        setStatus("idle");
        toast.error("Algo correu mal. Tenta novamente.");
        return;
      }

      if (data?.duplicate) {
        setStatus("duplicate");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("idle");
      toast.error("Algo correu mal. Tenta novamente.");
    }
  };

  return (
    <section id="participar" className="section-padding relative overflow-hidden py-[60px]">
      <FloatingDots />
      <div className="container max-w-2xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}>
          
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            COMO PARTICIPAR 🪷
          </p>
          <TextReveal className="text-foreground mb-6" delay={0.1}>
            Junta-te a nós
          </TextReveal>
          <div className="space-y-4 text-muted-foreground mb-10 leading-relaxed">
            <p>Acreditamos na força da sinergia e da colaboração para construir este futuro.


Queres receber informação sobre próximos eventos? Junta-te à Comunidade do WhatsApp ou contacta-nos.

            </p>
          </div>
        </motion.div>

        {/* WhatsApp CTA — primary */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-4 shadow-sm">
          
          <div className="flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-[#25D366]" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <p className="text-sm tracking-widest uppercase text-accent font-medium">COMUNIDADE WHATSAPP</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Junta-te à nossa comunidade WhatsApp para acompanhar novidades e próximos eventos em primeira mão.
          </p>

          <a
            href="https://chat.whatsapp.com/F8bensGlhy8EHGsQpS4I2u"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-medium text-sm rounded-lg py-3 px-8 hover:bg-[#20bd5a] transition-colors duration-200 active:scale-[0.97]">
            Entrar na Comunidade
          </a>
        </motion.div>

        {/* Separator */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-muted-foreground my-6">
          Ou, se preferires, deixa o teu email para receber notificações
        </motion.p>

        {/* Email form — secondary */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">

          {status === "success" ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-accent font-medium py-4">
              Obrigado! Receberás notificações sobre os próximos eventos. 🪷
            </motion.p>
          ) : status === "duplicate" ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-accent font-medium py-4">
              Já temos o teu email! Receberás as novidades. 🪷
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                disabled={status === "loading"}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu email"
                required
                disabled={status === "loading"}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50" />

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Algum comentário? (opcional)"
                disabled={status === "loading"}
                rows={3}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 resize-none" />

              <label className="flex items-start gap-3 text-left cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wantsToOrganize}
                  onChange={(e) => setWantsToOrganize(e.target.checked)}
                  disabled={status === "loading"}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-accent/50 disabled:opacity-50" />
                <span className="text-sm text-muted-foreground">
                  Tenho interesse em ajudar a organizar eventos
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] whitespace-nowrap disabled:opacity-50"
                disabled={status === "loading"}>
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    A enviar...
                  </span>
                ) : (
                  "Receber informações dos eventos"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
