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
import { WavyBackground } from "@/components/ui/wavy-background";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="relative">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <WavyBackground
              backgroundFill="#F5F5F2"
              colors={[
                "rgba(230, 184, 106, 0.15)",
                "rgba(46, 58, 89, 0.08)",
                "rgba(210, 195, 170, 0.12)",
                "rgba(180, 155, 125, 0.10)",
                "rgba(225, 210, 175, 0.12)",
              ]}
              waveWidth={80}
              blur={40}
              speed="slow"
              waveOpacity={0.3}
              containerClassName="!h-full"
              className="hidden"
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
