export const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-destructive-foreground">
      <div className="container text-center space-y-4">
        <p className="font-serif text-lg text-foreground">Meditar por um Mundo Melhor</p>
        <p className="text-sm text-muted-foreground">
          Cada presença conta.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="mailto:info@meditarmundomelhor.org" className="hover:text-accent transition-colors duration-200">
            info@meditarmundomelhor.org
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60 pt-4">
          © 2026 Meditar por um Mundo Melhor
        </p>
      </div>
    </footer>);

};