import React, { useState } from "react";
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
    icon?: JSX.Element;
  }[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-border/40 rounded-2xl bg-background/80 backdrop-blur-md shadow-lg z-[5000] px-6 py-3 items-center justify-center gap-1",
          className
        )}
      >
        <nav className="flex items-center gap-1">
          {navItems.map((navItem, idx: number) => (
            <a
              key={`nav-${idx}`}
              href={navItem.link}
              className="relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-1.5"
            >
              {navItem.icon}
              <span>{navItem.name}</span>
            </a>
          ))}
        </nav>

        {ctaLabel && (
          <>
            <div className="h-5 w-px bg-border/60 mx-2" />
            <a
              href={ctaHref || "#"}
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-all duration-200 active:scale-[0.97]"
            >
              {ctaLabel}
            </a>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
