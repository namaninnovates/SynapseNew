import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Briefcase, Target, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "react-router";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-4 bg-primary/10 rounded-2xl"
              >
                <Brain className="h-16 w-16 text-primary" />
              </motion.div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              Your Career,{" "}
              <span className="text-primary">Simulated</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
            >
              Experience your future career through AI-powered simulations. 
              Discover your potential, test-drive jobs, and build a portfolio 
              that showcases your capabilities.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/dashboard">
                    {user?.onboardingCompleted ? "Dashboard" : "Complete Setup"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to="/auth">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link to="/auth">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              How Synapse Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform analyzes your skills and creates personalized 
              career simulations to help you explore your potential.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Skills Analysis",
                description: "AI analyzes your resume, LinkedIn, and video intro to map your unique skill profile with precision.",
                delay: 0.1
              },
              {
                icon: Target,
                title: "Career Trajectories",
                description: "Discover personalized career paths based on your skills, interests, and market trends.",
                delay: 0.2
              },
              {
                icon: Briefcase,
                title: "Micro-Internships",
                description: "Test-drive careers through realistic project simulations with AI mentorship and feedback.",
                delay: 0.3
              },
              {
                icon: Users,
                title: "AI Mentorship",
                description: "Get personalized guidance from AI mentors with industry-specific expertise and experience.",
                delay: 0.4
              },
              {
                icon: TrendingUp,
                title: "Portfolio Building",
                description: "Build a compelling portfolio showcasing your simulated work experience and capabilities.",
                delay: 0.5
              },
              {
                icon: Zap,
                title: "Real-time Feedback",
                description: "Receive instant, actionable feedback to improve your skills and career readiness.",
                delay: 0.6
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-6">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Ready to Simulate Your Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of professionals discovering their career potential 
              through AI-powered simulations.
            </p>
            
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Button asChild size="lg" className="text-lg px-12 py-6">
                  <Link to="/auth">
                    Start Your Simulation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}