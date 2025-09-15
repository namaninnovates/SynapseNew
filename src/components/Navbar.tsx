import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Brain, Menu, User, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);
  const [hue, setHue] = useState(265);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHue((h) => (h + 1) % 360);
    }, 40);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-transparent"
    >
      {/* Pill-shaped, centered container with margins and soft shadow */}
      <div
        className={[
          "pointer-events-none px-8 sm:px-12 lg:px-20",
          "mt-10",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-auto mx-auto max-w-6xl",
            "rounded-full",
            "backdrop-blur-xl backdrop-saturate-150",
            "bg-white/30 dark:bg-white/10",
            "shadow-lg shadow-black/10 dark:shadow-black/40",
            "transition-all duration-300",
            scrolled ? "scale-[0.98] backdrop-blur-2xl" : "",
            "border",
          ].join(" ")}
          style={{
            borderWidth: 1.5,
            borderColor: `hsl(${hue} 90% ${theme === "dark" ? "55%" : "60%"})`,
          }}
        >
          <div className="px-4 sm:px-5">
            <div className="h-14 flex items-center justify-between">
              {/* Left: Logo + Text */}
              <Link to="/" className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold tracking-tight">Synapse</span>
              </Link>

              {/* Right: Nav items + controls (desktop) */}
              <div className="hidden md:flex items-center gap-4">
                <nav className="flex items-center gap-1">
                  {[
                    { label: "Home", href: "/#top" },
                    { label: "Why Synapse", href: "/#why-synapse" },
                    { label: "How It Works", href: "/#how-it-works" },
                    { label: "Story", href: "/#story" },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="px-3 py-1.5 text-sm font-medium rounded-full text-foreground/90 hover:text-foreground transition group"
                    >
                      <span className="inline-block group-hover:scale-[1.02] transition">
                        {item.label}
                      </span>
                      <span className="block h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded bg-primary/70 mt-1 mx-auto" />
                    </a>
                  ))}
                </nav>

                {/* Separate pill for theme + profile on extreme right */}
                <div className="flex items-center gap-1 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 backdrop-blur-xl px-1.5 py-1 shadow-lg shadow-black/5">
                  {/* Theme toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-8 w-8 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20"
                    title="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-indigo-600" />
                    )}
                  </Button>

                  {/* Profile */}
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 px-2 rounded-full bg-transparent">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Profile"} />
                            <AvatarFallback className="text-xs">
                              {(user?.name?.[0] ?? "U").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/portfolio")}>
                          Portfolio
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={async () => {
                            await signOut();
                            navigate("/");
                          }}
                        >
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/auth")}
                      className="h-8 w-8 rounded-full"
                      title="Sign in"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile controls inside pill */}
              <div className="md:hidden flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20"
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="h-9 w-9 rounded-full"
                  title="Menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile slide-out panel */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 dark:border-white/10 bg-background/90 backdrop-blur-sm rounded-b-full"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                <a
                  href="/#top"
                  className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/#why-synapse"
                  className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Why Synapse
                </a>
                <a
                  href="/#how-it-works"
                  className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="/#story"
                  className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Story
                </a>

                {isAuthenticated ? (
                  <>
                    <a
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <a
                      href="/portfolio"
                      className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Portfolio
                    </a>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={async () => {
                        await signOut();
                        setMobileMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <a
                    href="/auth"
                    className="block px-3 py-2 text-base font-medium hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}