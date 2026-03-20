import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OrgTicker } from "@/components/OrgTicker";
import { NextEvent } from "@/components/NextEvent";
import { About } from "@/components/About";
import { Mission } from "@/components/Mission";
import { Participate } from "@/components/Participate";
import { PastEvents } from "@/components/PastEvents";
import { Organizers } from "@/components/Organizers";
import { Footer } from "@/components/Footer";
import Aurora from "@/components/Aurora";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="relative overflow-x-clip overflow-y-visible">
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ top: '-10%', bottom: '-10%', left: '-10%', right: '-10%' }}>
            <Aurora
              colorStops={["#D6B478", "#2E3A59", "#D6B478"]}
              amplitude={0.8}
              blend={0.6}
              speed={0.3}
            />
          </div>
          <Hero />
          <OrgTicker />
          <NextEvent />
        </div>
        <About />
        <Mission />
        <Participate />
        <PastEvents />
        <Organizers />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
