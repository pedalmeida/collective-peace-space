import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NextEvent } from "@/components/NextEvent";
import { About } from "@/components/About";
import { Mission } from "@/components/Mission";
import { Participate } from "@/components/Participate";
import { PastEvents } from "@/components/PastEvents";
import { Organizers } from "@/components/Organizers";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <NextEvent />
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
