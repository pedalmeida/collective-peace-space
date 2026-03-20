import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  ctaLabel,
  ctaHref,
  className,
}: {
  navItems: {
    name: string;
    link: string;
  }[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [pastHero, setPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track active section & past-hero state
  const updateActiveSection = useCallback(() => {
    setPastHero(window.scrollY > window.innerHeight * 0.6);

    const sections = navItems
      .map((item) => item.link.replace("#", ""))
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    let current = "";
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) {
        current = section.id;
      }
    }
    setActiveSection(current);
  }, [navItems]);

  useEffect(() => {
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [updateActiveSection]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-4 inset-x-0 mx-auto border border-border/40 rounded-2xl bg-background/80 backdrop-blur-md shadow-lg z-[5000] px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-center gap-1 max-w-fit",
          className
        )}
      >
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((navItem, idx) => {
            const sectionId = navItem.link.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={`nav-${idx}`}
                href={navItem.link}
                className={cn(
                  "relative text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center",
                  isActive
                    ? "text-foreground bg-accent/60 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                )}
              >
                {navItem.name}
              </a>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-[4px] p-2 rounded-lg hover:bg-accent/30 transition-colors"
          aria-label="Menu"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[2px] bg-foreground rounded-full origin-center"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-[2px] bg-foreground rounded-full"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[2px] bg-foreground rounded-full origin-center"
          />
        </button>

        {/* Mobile active label */}
        <span className="md:hidden text-sm text-foreground font-medium px-1">
          {navItems.find((i) => i.link.replace("#", "") === activeSection)?.name || navItems[0]?.name}
        </span>

        {/* CTA (desktop) */}
        {ctaLabel && pastHero && (
          <>
            <div className="hidden md:block h-5 w-px bg-border/60 mx-2" />
            <a
              href={ctaHref || "#"}
              className="hidden md:block text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-all duration-200 active:scale-[0.97]"
            >
              {ctaLabel}
            </a>
          </>
        )}
      </motion.div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[70px] inset-x-0 mx-auto z-[4999] w-[calc(100%-2rem)] max-w-xs bg-background/95 backdrop-blur-md border border-border/40 rounded-xl shadow-lg p-3 flex flex-col gap-1"
        >
          {navItems.map((navItem, idx) => {
            const sectionId = navItem.link.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={`mobile-nav-${idx}`}
                href={navItem.link}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-sm px-4 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-foreground bg-accent/60 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                )}
              >
                {navItem.name}
              </a>
            );
          })}
          {ctaLabel && pastHero && (
            <a
              href={ctaHref || "#"}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-center bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-all duration-200 active:scale-[0.97] mt-1"
            >
              {ctaLabel}
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
