import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Rocket,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import BackgroundAurora from "@/components/BackgroundAurora";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

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

  // Smooth scroll to the "How It Works" section
  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "#how-it-works";
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden`}>
      {/* Prism background with soft overlay, content sits above */}
      <BackgroundAurora animationType="3drotate" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/10 via-background/20 to-background/20 pointer-events-none" />
      {/* Wrap scrolling content so it stays above the fixed background/overlay */}
      <div className="relative z-20">
        {/* Hero Section */}
        <section className="pt-28 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center min-h-[70vh] grid place-items-center">
          <span id="top" className="absolute -top-24" />
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-10 items-center justify-items-center justify-center">
            {/* Left: Text */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-4 text-center text-white"
              >
                Your{" "}
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white"
                >
                  Career
                </motion.span>
                {", "}
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{}}
                  className="text-white opacity-100"
                >
                  Simulated
                </motion.span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-3 mx-auto"
              >
                From lost to confident — test-drive your dream career with AI.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-base md:text-lg text-muted-foreground max-w-2xl mb-8 mx-auto"
              >
                Experience your future career through hands-on simulations. Discover your
                strengths, explore trajectories, and build a portfolio that proves it.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-center"
              >
                {isAuthenticated ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="relative overflow-hidden text-base md:text-lg px-8 py-6 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:from-white/20 hover:to-white/10 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/40"
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
                      variant="ghost"
                      size="lg"
                      className="relative overflow-hidden text-base md:text-lg px-8 py-6 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:from-white/20 hover:to-white/10 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/40"
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

            {/* Right: Hero Visual - simplify to a clean, neutral card without background blobs/overlays */}
            {/* Removed empty right-side container to keep hero fully centered */}
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
                  className={`group relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 transition will-change-transform hover:-translate-y-1.5 hover:shadow-md`}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0.9 }}
                    whileHover={
                      item.emoji === "💡"
                        ? { scale: 1.05, filter: "brightness(1.05)" }
                        : item.emoji === "🎮"
                        ? { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 1.2 } }
                        : { rotate: [0, -3, 3, 0], transition: { duration: 0.8 } }
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
        <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
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
                    <div className="rounded-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 shadow-[0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-black/5 dark:ring-white/10 transition will-change-transform backdrop-blur-xl hover:-translate-y-1.5 hover:shadow-[0_0_50px_rgba(99,102,241,0.28),0_0_60px_rgba(236,72,153,0.18)] hover:ring-2 hover:ring-primary/50">
                      {/* Gradient inner glow overlay */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400/15 via-purple-400/15 to-pink-400/15 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Inner ring for glass depth */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/40 dark:ring-white/10"
                      />
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
                className="relative rounded-3xl border dark:border-white/10 p-6 md:p-8 overflow-hidden will-change-transform transition-transform duration-200"
              >
                <div className="relative aspect-[4/3] rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 grid place-items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center px-6"
                  >
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-secondary grid place-items-center">
                      <Users className="h-10 w-10 text-primary" />
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
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="text-center">
                <h4 className="text-2xl font-semibold">
                  Don't just plan your career.{" "}
                  <span className="animate-pulse">
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
                    <Button asChild size="lg">
                      <Link to="/auth">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                )}
                <div className="mt-4 text-sm text-muted-foreground">Created by Team DataVista</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}