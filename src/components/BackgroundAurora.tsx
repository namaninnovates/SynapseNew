import { motion } from "framer-motion";

export default function BackgroundAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft radial gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.10),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.10),transparent_50%)]" />

      {/* Animated blobs */}
      <motion.div
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 10, 0], rotate: [0, 10, -5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, 20, -20, 0], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{ x: [0, 20, -20, 0], y: [0, 15, -10, 0], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
