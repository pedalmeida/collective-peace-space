import { motion } from "motion/react";

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  delay?: number;
}

export const AnimatedImage = ({
  src,
  alt,
  className = "",
  loading,
  delay = 0,
}: AnimatedImageProps) => {
  return (
    <motion.div
      className="overflow-hidden w-full h-full"
      initial={{ filter: "blur(8px)", opacity: 0, scale: 1.06 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay,
      }}
      whileHover={{ scale: 0.97 }}
    >
      <motion.img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      />
    </motion.div>
  );
};
