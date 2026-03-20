import { FloatingNav } from "@/components/ui/floating-navbar";

const navItems = [
  { name: "Sobre", link: "#sobre" },
  { name: "Participar", link: "#participar" },
  { name: "Eventos passados", link: "#eventos" },
];

export const Header = () => {
  return (
    <FloatingNav
      navItems={navItems}
      ctaLabel="Junta-te"
      ctaHref="#participar"
    />
  );
};
