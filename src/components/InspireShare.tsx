import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Share2, Send, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TextReveal } from "./TextReveal";
import { FloatingDots } from "./FloatingDots";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Quote {
  id: string;
  text: string;
  author: string | null;
}

interface NextEvent {
  date: string;
  time: string;
  title: string;
}

export const InspireShare = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [current, setCurrent] = useState<Quote | null>(null);
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [quotesRes, eventRes] = await Promise.all([
      supabase.from("quotes").select("id, text, author").eq("is_active", true),
      supabase.
      from("events").
      select("date, time, title").
      eq("is_past", false).
      order("date", { ascending: true }).
      limit(1).
      maybeSingle()]
      );

      if (quotesRes.data?.length) {
        setQuotes(quotesRes.data);
        setCurrent(quotesRes.data[Math.floor(Math.random() * quotesRes.data.length)]);
      }
      if (eventRes.data) setNextEvent(eventRes.data);
    };
    fetchData();
  }, []);

  const nextQuote = useCallback(() => {
    if (quotes.length <= 1) return;
    let next: Quote;
    do {
      next = quotes[Math.floor(Math.random() * quotes.length)];
    } while (next.id === current?.id);
    setCurrent(next);
    setAnimKey((k) => k + 1);
  }, [quotes, current]);

  const getEventString = () => {
    if (!nextEvent) return "";
    const d = new Date(nextEvent.date + "T00:00:00");
    const day = format(d, "d 'de' MMMM", { locale: pt });
    const time = nextEvent.time?.slice(0, 5) || "14:00";
    return `no dia ${day} às ${time}`;
  };

  const handleShare = async () => {
    if (!current) return;
    const eventStr = getEventString();
    const msg = `🌿 "${current.text}"${current.author ? ` — ${current.author}` : ""}\n\nVou participar neste evento de meditação para um mundo melhor ${eventStr} 🙏\n\nJunta-te a mim:\nhttps://meditarmundomelhor.org`;

    if (navigator.share) {
      try {
        await navigator.share({ text: msg });
      } catch {

        /* user cancelled */}
    } else {
      await navigator.clipboard.writeText(msg);
      // Simple feedback
      const btn = document.getElementById("share-btn");
      if (btn) {
        btn.textContent = "Copiado! ✓";
        setTimeout(() => btn.textContent = "Partilhar 🌍", 2000);
      }
    }
  };

  const handleWhatsApp = () => {
    if (!current) return;
    const eventStr = getEventString();
    const msg = `Pensei em ti ao ler isto 🌿\n\n"${current.text}"${current.author ? ` — ${current.author}` : ""}\n\nVamos juntos a este evento ${eventStr}?\nhttps://meditarmundomelhor.org`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!current) return null;

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16 relative overflow-hidden">
      <FloatingDots />
      <div className="container max-w-2xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}>
          
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            Inspira-te e Partilha 🌿
          </p>
          <TextReveal className="text-foreground mb-6" delay={0.1}>
            Deixa que uma pequena frase inspire uma grande mudança.
          </TextReveal>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
          
          {/* Quote display */}
          <div className="min-h-[120px] flex items-center justify-center mb-6 py-0">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={animKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-center">
                
                <p className="font-['Playfair_Display'] text-xl md:text-2xl text-foreground leading-relaxed italic">
                  "{current.text}"
                </p>
                {current.author &&
                <footer className="mt-3 text-sm text-muted-foreground">
                    — {current.author}
                  </footer>
                }
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Inspire button */}
          <button
            onClick={nextQuote}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors duration-200 mb-6">
            
            <RefreshCw className="w-4 h-4" />
            Inspira-me 🌿
          </button>

          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="share-btn"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-200">
              
              <Share2 className="w-4 h-4" />
              Partilhar 🌍
            </button>
            





            
          </div>
        </motion.div>
      </div>
    </section>);

};