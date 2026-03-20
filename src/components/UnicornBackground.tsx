import { useEffect, useRef } from "react";

declare global {
  interface Window {
    initUnicorn?: () => void;
  }
}

export const UnicornBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if script already loaded
    if (document.querySelector('script[data-unicorn-loader]')) {
      window.initUnicorn?.();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.unicorn.studio/v2.1.0-1/dist/unicornStudio.umd.js";
    script.setAttribute("data-unicorn-loader", "true");
    script.onload = () => {
      window.initUnicorn?.();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup not strictly needed as unicorn manages itself
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-us-project="JqDXRbbFENnGDP7LAt9b"
      className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50"
      style={{ top: '-10%', bottom: '-10%', left: '-10%', right: '-10%' }}
    />
  );
};
