import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OrgTicker } from "@/components/OrgTicker";
import { NextEvent } from "@/components/NextEvent";
import { About } from "@/components/About";
import { Mission } from "@/components/Mission";
import { Participate } from "@/components/Participate";
import { InspireShare } from "@/components/InspireShare";
import { PastEvents } from "@/components/PastEvents";
import { Organizers } from "@/components/Organizers";
import { Footer } from "@/components/Footer";
import { UnicornBackground } from "@/components/UnicornBackground";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="relative overflow-x-clip overflow-y-visible">
          <UnicornBackground />
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
