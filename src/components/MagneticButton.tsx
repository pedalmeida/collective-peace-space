import { useRef, useState, ReactNode } from "react";
import { motion, useSpring } from "motion/react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  as?: "a" | "button";
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  strength?: number;
}

export const MagneticButton = ({
  children,
  className = "",
  as = "a",
  href,
  type,
  onClick,
  strength = 0.3,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const Comp = as === "a" ? "a" : "button";

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Comp
        href={as === "a" ? href : undefined}
        type={as === "button" ? type : undefined}
        onClick={onClick}
        className={className}
      >
        {children}
      </Comp>
    </motion.div>
  );
};
