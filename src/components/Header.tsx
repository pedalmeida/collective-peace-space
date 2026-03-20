import { Reveal } from "./Reveal";

const navLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Missão", href: "#missao" },
  { label: "Participar", href: "#participar" },
  { label: "Eventos", href: "#eventos" },
];

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-serif text-lg text-foreground">
          Meditar
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#participar"
          className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]"
        >
          Junta-te
        </a>
      </div>
    </header>
  );
};
