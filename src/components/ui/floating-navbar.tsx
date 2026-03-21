import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
} from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Floating pill navbar */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-4 inset-x-0 mx-auto border border-border/40 rounded-2xl bg-background/80 backdrop-blur-md shadow-lg z-[5000] px-4 py-2.5 md:px-6 md:py-3 hidden lg:flex items-center justify-center gap-1 max-w-fit",
          className
        )}
      >
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
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

        {/* Tablet & Mobile: hamburger toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex flex-col gap-[4px] p-2 rounded-lg hover:bg-accent/30 transition-colors"
          aria-label="Abrir menu"
        >
          <span className="block w-5 h-[2px] bg-foreground rounded-full" />
          <span className="block w-5 h-[2px] bg-foreground rounded-full" />
          <span className="block w-5 h-[2px] bg-foreground rounded-full" />
        </button>

        {/* CTA (desktop) */}
        {ctaLabel && (
          <motion.div
            className="hidden lg:flex items-center overflow-hidden"
            initial={false}
            animate={{
              maxWidth: pastHero ? 200 : 0,
              opacity: pastHero ? 1 : 0,
            }}
            transition={{
              maxWidth: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: pastHero ? 0.4 : 0.2, delay: pastHero ? 0.1 : 0 },
            }}
          >
            <div className="h-5 w-px bg-border/60 mx-2 shrink-0" />
            <a
              href={ctaHref || "#"}
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              {ctaLabel}
              <span className="inline-flex items-center justify-center w-4 h-4 bg-white/90 rounded-full">
                <ArrowRight className="w-2.5 h-2.5 text-primary" />
              </span>
            </a>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile side drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[5001] lg:hidden"
            />

            {/* Drawer panel */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[80vw] bg-background/95 backdrop-blur-xl border-l border-border/30 shadow-2xl z-[5002] lg:hidden flex flex-col"
            >
              {/* Close button */}
              <div className="flex items-center justify-end p-5">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent/30 transition-colors"
                  aria-label="Fechar menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-col gap-1 px-4 flex-1">
                {navItems.map((navItem, idx) => {
                  const sectionId = navItem.link.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <motion.a
                      key={`drawer-nav-${idx}`}
                      href={navItem.link}
                      onClick={() => setDrawerOpen(false)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.1 + idx * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={cn(
                        "text-base px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "text-foreground bg-accent/60 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      )}
                    >
                      {navItem.name}
                    </motion.a>
                  );
                })}
              </div>

              {/* CTA at bottom */}
              {ctaLabel && (
                <div className="p-4 mt-auto">
                  <motion.a
                    href={ctaHref || "#"}
                    onClick={() => setDrawerOpen(false)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + navItems.length * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="block text-center text-sm bg-primary text-primary-foreground px-4 py-3 rounded-xl hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] font-medium"
                  >
                    {ctaLabel}
                  </motion.a>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
