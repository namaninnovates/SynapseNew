import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Target,
  TrendingUp,
  Users,
  Zap,
  Rocket,
  Laptop,
  PenTool,
  FileText,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  // Custom cursor state
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isDown, setIsDown] = useState(false);
  const [overInteractive, setOverInteractive] = useState(false);

  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const fullQuote =
    "“I felt stuck—too many choices, no clear direction. Synapse helped me test-drive product roles through real simulations. I discovered what I'm great at and built a portfolio I'm proud of. I went from confused to confident.”";

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTypedText(fullQuote.slice(0, i + 1));
      i++;
      if (i >= fullQuote.length) {
        clearInterval(id);
        setTypingDone(true);
      }
    }, 18);
    return () => clearInterval(id);
  }, []);

  // Initialize custom cursor only on fine pointers (desktop/laptop)
  useEffect(() => {
    const isFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: fine)").matches;

    if (!isFinePointer) {
      setShowCursor(false);
      return;
    }

    setShowCursor(true);

    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleDown = () => setIsDown(true);
    const handleUp = () => setIsDown(false);
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest?.(
        "a,button,[role='button'],input,textarea,select,label"
      );
      setOverInteractive(!!interactive);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseover", handleOver);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseover", handleOver);
    };
  }, []);

  const triggerRipple = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.currentTarget as HTMLButtonElement;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.position = "absolute";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "rgba(255,255,255,0.45)";
    ripple.style.transform = "scale(0)";
    ripple.style.opacity = "0.9";
    ripple.style.pointerEvents = "none";
    ripple.style.transition = "transform 600ms ease-out, opacity 600ms ease-out";
    target.style.position = "relative";
    target.style.overflow = "hidden";
    target.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "scale(2.5)";
      ripple.style.opacity = "0";
    });
    setTimeout(() => ripple.remove(), 650);
  };

  const triggerConfetti = (x: number, y: number) => {
    const colors = ["#6366F1", "#A855F7", "#EC4899", "#22C55E", "#F59E0B"];
    for (let i = 0; i < 16; i++) {
      const dot = document.createElement("span");
      dot.style.position = "fixed";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.width = dot.style.height = `${6 + Math.random() * 6}px`;
      dot.style.borderRadius = "9999px";
      dot.style.background = colors[i % colors.length];
      dot.style.pointerEvents = "none";
      dot.style.opacity = "0.9";
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      dot.style.transform = "translate(0,0)";
      dot.style.transition = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out";
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${tx}px, ${ty}px)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 800);
    }
  };

  const handleCTA = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    triggerRipple(e);
    triggerConfetti(e.clientX, e.clientY);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sizes for cursor elements
  const dotSize = isDown ? 10 : 8;
  const ringSize = overInteractive ? 48 : isDown ? 36 : 32;

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${showCursor ? "cursor-none" : ""}`}>
      {/* Subtle page background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f9ff] via-white to-white" />
        {/* Abstract glow shapes */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/20 via-indigo-300/20 to-purple-300/20 blur-3xl" />
        {/* Dynamic gradient blobs for liveliness */}
        <motion.div
          aria-hidden
          initial={{ x: -60, y: 0, opacity: 0.35 }}
          animate={{ x: [ -60, 40, -60 ], y: [0, -20, 0], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-10 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-300/30 via-purple-300/30 to-pink-300/30 blur-3xl"
        />
        <motion.div
          aria-hidden
          initial={{ x: 40, y: 20, opacity: 0.35 }}
          animate={{ x: [ 40, -50, 40 ], y: [20, 0, 20], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 bottom-24 h-72 w-72 rounded-full bg-gradient-to-tr from-pink-300/25 via-amber-300/25 to-indigo-300/25 blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <span id="top" className="absolute -top-24" />
        {/* background wave */}
        <svg
          className="absolute -z-10 -top-10 right-0 h-[420px] w-[900px] opacity-40 text-indigo-50"
          viewBox="0 0 900 600"
          fill="none"
        >
          <path
            d="M0,300 C150,200 300,400 450,300 C600,200 750,300 900,200 L900,600 L0,600 Z"
            fill="currentColor"
          />
        </svg>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              {/* Animated emblem */}
              <motion.div
                initial={{ scale: 0.9, rotate: -4, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
                className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur-sm"
              >
                <Brain className="h-12 w-12 text-[#4285F4]" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-4"
            >
              Your{" "}
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[#4285F4]"
              >
                Career
              </motion.span>
              {", "}
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ backgroundSize: "200% 200%" }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              >
                Simulated
              </motion.span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-3"
            >
              From lost to confident — test-drive your dream career with AI.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mb-8"
            >
              Experience your future career through hands-on simulations. Discover your
              strengths, explore trajectories, and build a portfolio that proves it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isAuthenticated ? (
                <Button
                  asChild
                  size="lg"
                  onClick={handleCTA}
                  className="relative overflow-hidden text-base md:text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_0_40px] hover:shadow-purple-500/30 transition-shadow"
                >
                  <Link to="/dashboard">
                    {user?.onboardingCompleted ? "Dashboard" : "Complete Setup"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    onClick={handleCTA}
                    className="relative overflow-hidden text-base md:text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_0_40px] hover:shadow-purple-500/30 transition-shadow"
                  >
                    <Link to="/auth">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={scrollToHowItWorks}
                    className="text-base md:text-lg px-8 py-6 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    See How It Works
                  </Button>
                </>
              )}
            </motion.div>
          </div>

          {/* Right: Hero Visual */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl border p-6 md:p-8 shadow-sm"
            >
              {/* Gradient orb */}
              <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-2xl" />
              <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-pink-400/20 to-amber-300/20 blur-2xl" />

              {/* Central abstract panel */}
              <div className="relative z-10 aspect-[4/3] rounded-2xl bg-white ring-1 ring-black/5 p-6 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 opacity-50" />
                <div className="relative grid place-items-center">
                  <motion.div
                    initial={{ scale: 0.95, rotate: 0 }}
                    animate={{ scale: 1, rotate: 0.5 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 6, ease: "easeInOut" }}
                    className="h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 blur-xl opacity-60"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 text-center"
                  >
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-white/60 backdrop-blur ring-1 ring-black/5 grid place-items-center">
                      <Rocket className="h-8 w-8 text-indigo-600" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Explore branching career paths
                    </p>
                  </motion.div>
                </div>

                {/* Floating icons */}
                <motion.div
                  className="absolute left-6 top-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/70 ring-1 ring-black/5 grid place-items-center">
                    <Laptop className="h-5 w-5 text-purple-600" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-8 top-10"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/70 ring-1 ring-black/5 grid place-items-center">
                    <PenTool className="h-5 w-5 text-pink-600" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-10 bottom-8"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/70 ring-1 ring-black/5 grid place-items-center">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-12 bottom-6"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/70 ring-1 ring-black/5 grid place-items-center">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Synapse */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <span id="why-synapse" className="block -mt-24 pt-24" />
        <div className="max-w-7xl mx-auto">
          {/* Scroll-reveal header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why Synapse?</h2>
            <p className="text-muted-foreground text-lg mt-3">
              Three simple reasons to start today
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Discover",
                emoji: "💡",
                desc: "Uncover your strengths with AI-powered skill analysis.",
                bg: "from-sky-50 to-indigo-50",
              },
              {
                title: "Simulate",
                emoji: "🎮",
                desc: "Test-drive careers through micro-internships that feel real.",
                bg: "from-violet-50 to-fuchsia-50",
              },
              {
                title: "Build Portfolio",
                emoji: "📂",
                desc: "Showcase your work and unlock opportunities with confidence.",
                bg: "from-emerald-50 to-teal-50",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className={`group relative rounded-2xl border bg-gradient-to-br ${item.bg} p-6 transition will-change-transform backdrop-blur-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/10`}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.9 }}
                  whileHover={
                    item.emoji === "💡"
                      ? { scale: 1.05, filter: "brightness(1.1)" }
                      : item.emoji === "🎮"
                      ? { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 1.2 } }
                      : { rotate: [0, -4, 4, 0], transition: { duration: 0.8 } }
                  }
                  className="text-3xl"
                >
                  {item.emoji}
                </motion.div>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          {/* Scroll-reveal header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg mt-3">
              A simple path from curious to confident
            </p>
          </motion.div>
 
          <div className="relative">
            {/* Animated vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
              className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"
            />
            <ol className="space-y-8 md:space-y-10">
              {[
                { label: "Onboarding", desc: "Connect LinkedIn, upload your resume, record a short intro." },
                { label: "Skill Graph", desc: "See your AI-generated strengths map, clearly visualized." },
                { label: "Career Path", desc: "Explore trajectories with match scores and growth trends." },
                { label: "Micro-Internship", desc: "Work on realistic projects with guidance and feedback." },
                { label: "Portfolio", desc: "Publish your wins and show your simulated experience." },
              ].map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 * i }}
                  className="relative pl-16 md:pl-20"
                >
                  <div className="absolute left-0 md:left-1">
                    <div className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                      <span className="text-lg md:text-xl font-semibold text-indigo-600">{i + 1}</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-5 ring-1 ring-black/5 shadow-sm">
                    <h4 className="text-lg font-semibold">{step.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Student Story */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <span id="story" className="block -mt-24 pt-24" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left column reveal */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h3 className="text-3xl font-bold tracking-tight">Priya's Story</h3>
            <p className="text-muted-foreground mt-4 text-lg">
              {typedText}
            </p>
            {typingDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm"
              >
                <span>From </span>
                <span className="text-rose-600 font-semibold">confused</span>
                <span> to </span>
                <span className="text-emerald-600 font-semibold">confident</span>
                <span> — and a standout </span>
                <span className="text-indigo-600 font-semibold">portfolio</span>
                <span>.</span>
              </motion.div>
            )}
            <div className="mt-6">
              <Button asChild className="px-6">
                <Link to="/auth">Try Your Own Story</Link>
              </Button>
            </div>
          </motion.div>
          {/* Right column reveal */}
          <motion.div
            className="order-1 lg:order-2"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width - 0.5;
              const py = (e.clientY - rect.top) / rect.height - 0.5;
              const inner = el.querySelector("[data-parallax]") as HTMLElement | null;
              if (inner) {
                inner.style.transform = `rotateX(${py * -4}deg) rotateY(${px * 4}deg) translateZ(0)`;
              }
            }}
            onMouseLeave={(e) => {
              const inner = (e.currentTarget.querySelector("[data-parallax]") as HTMLElement | null);
              if (inner) inner.style.transform = "";
            }}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              data-parallax
              className="relative rounded-3xl border bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8 overflow-hidden will-change-transform transition-transform duration-200"
            >
              <div className="absolute -top-12 -left-8 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 blur-2xl" />
              <div className="absolute -bottom-10 -right-8 h-44 w-44 rounded-full bg-gradient-to-tr from-pink-300/30 to-amber-300/30 blur-2xl" />
              <div className="relative aspect-[4/3] rounded-2xl bg-white ring-1 ring-black/5 grid place-items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center px-6"
                >
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-50 grid place-items-center">
                    <Users className="h-10 w-10 text-indigo-600" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    A young professional at a crossroads, exploring branching paths with confidence.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 relative overflow-hidden">
        <motion.div
          aria-hidden
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "300% 300%" }}
          className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-80"
        />
        <div className="text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center">
              <h4 className="text-2xl font-semibold">
                Don't just plan your career.{" "}
                <span className="drop-shadow-[0_0_10px_rgba(236,72,153,0.6)] animate-pulse">
                  Simulate it.
                </span>
              </h4>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {[
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                  { label: "Contact", href: "#" },
                  { label: "Twitter/X", href: "#" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm transform will-change-transform hover:rotate-2 hover:scale-105"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              {!isAuthenticated && (
                <div className="mt-8">
                  <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-white/90">
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
              <div className="mt-4 text-sm text-white/90">Created by Team DataVista</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Cursor Overlay */}
      {showCursor && (
        <div className="pointer-events-none fixed inset-0 z-50">
          {/* Gradient dot */}
          <motion.div
            aria-hidden
            className="fixed top-0 left-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            style={{ width: dotSize, height: dotSize }}
            animate={{
              x: cursorPos.x - dotSize / 2,
              y: cursorPos.y - dotSize / 2,
              scale: overInteractive ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.4 }}
          />
          {/* Glassy ring */}
          <motion.div
            aria-hidden
            className="fixed top-0 left-0 rounded-full border border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.25)] bg-transparent"
            style={{ width: ringSize, height: ringSize }}
            animate={{
              x: cursorPos.x - ringSize / 2,
              y: cursorPos.y - ringSize / 2,
              scale: overInteractive ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.7 }}
          />
        </div>
      )}
    </div>
  );
}