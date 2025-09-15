import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

type PrismProps = PropsWithChildren<{
  className?: string;
  glowClassName?: string;
  speedSeconds?: number;
}>;

// A lightweight gradient-glow wrapper that creates a smooth, rotating conic gradient halo around children.
// No extra deps. The gradient sits behind the content and softly bleeds around the edges.
export function Prism({
  children,
  className,
  glowClassName,
  speedSeconds = 10,
}: PrismProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow layer behind content */}
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-[2px] rounded-2xl z-0",
          // Use a strong gradient + blur for modern glow. Keep opacity controlled via backdrop context.
          "blur-xl opacity-70",
          glowClassName
        )}
        style={{
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,0.7), rgba(168,85,247,0.7), rgba(236,72,153,0.7), rgba(99,102,241,0.7))",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: speedSeconds }}
      />
      {/* Content above glow */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
