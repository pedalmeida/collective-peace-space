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
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="relative overflow-hidden">
          <BackgroundGradientAnimation
            gradientBackgroundStart="hsl(50, 11%, 95%)"
            gradientBackgroundEnd="hsl(50, 11%, 95%)"
            firstColor="214, 180, 120"
            secondColor="190, 170, 145"
            thirdColor="210, 195, 170"
            fourthColor="180, 155, 125"
            fifthColor="225, 210, 175"
            pointerColor="200, 170, 120"
            size="60%"
            blendingValue="soft-light"
            interactive={true}
            containerClassName="opacity-50 -translate-x-[20%]"
          />
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
