import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Brain, Menu, User, X, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 relative border-b backdrop-blur-xl backdrop-saturate-150 bg-white/55 dark:bg-neutral-900/30 ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Animated gradient glass layer */}
      <motion.div
        aria-hidden
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
        className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Synapse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/portfolio" className="text-sm font-medium hover:text-primary transition-colors">
                  Portfolio
                </Link>

                {/* Theme toggle (desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 backdrop-blur-md shadow-md hover:bg-white/50 dark:hover:bg-white/20"
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                </Button>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Hey {user?.name || "there"}!
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Theme toggle (desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 backdrop-blur-md shadow-md hover:bg-white/50 dark:hover:bg-white/20"
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                </Button>

                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            {/* Theme toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full bg-white/30 dark:bg-white/10 border border-white/30 dark:border-white/10 backdrop-blur-md shadow-md hover:bg-white/50 dark:hover:bg-white/20"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-sm"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/portfolio"
                    className="block px-3 py-2 text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Portfolio
                  </Link>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Hey {user?.name || "there"}!
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}