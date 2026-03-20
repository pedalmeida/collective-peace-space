import { motion } from "motion/react";

const dots = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: `${8 + Math.random() * 84}%`,
  y: `${5 + Math.random() * 90}%`,
  size: 3 + Math.random() * 4,
  duration: 14 + Math.random() * 10,
  delay: Math.random() * 6,
}));

export const FloatingDots = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-accent/[0.08]"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -8, 5, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
};
