import { FloatingNav } from "@/components/ui/floating-navbar";

const navItems = [
  { name: "Sobre", link: "#sobre" },
  { name: "Missão", link: "#missao" },
  { name: "Participar", link: "#participar" },
  { name: "Eventos", link: "#eventos" },
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
