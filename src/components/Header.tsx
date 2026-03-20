import { useEffect, useState } from "react";

const navLinks = [
{ label: "Sobre", href: "#sobre" },
{ label: "Missão", href: "#missao" },
{ label: "Participar", href: "#participar" },
{ label: "Eventos", href: "#eventos" }];


export const Header = () => {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        

        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
            
              {link.label}
            </a>
          )}
        </nav>
        <a
          href="#participar"
          className={`text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-300 active:scale-[0.97] ${
          pastHero ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`
          }>
          
          Junta-te
        </a>
      </div>
    </header>);

};