import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, ExternalLink, MessageSquare, Play, Send,
  CheckCircle2, Star, TrendingUp, ChevronRight, Loader2,
  Award, Target, Lightbulb, ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { toast } from "sonner";

type Tab = "work" | "resources" | "chat";

export default function Projects() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.getUserProjects);
  const updateProjectContent = useMutation(api.projects.updateProjectContent);
  const submitProject = useMutation(api.projects.submitProject);
  const sendMessage = useAction(api.projects.sendProjectMessage);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [workContent, setWorkContent] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("work");
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects?.find((p) => p._id === selectedProjectId) ?? null;
  const messages = useQuery(
    api.projects.getProjectMessages,
    selectedProjectId ? { projectId: selectedProjectId as any } : "skip"
  );
  const feedbackData = useQuery(
    api.projects.getFeedback,
    selectedProjectId ? { projectId: selectedProjectId as any } : "skip"
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
      setWorkContent(projects[0].workContent ?? "");
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProject) setWorkContent(selectedProject.workContent ?? "");
  }, [selectedProjectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">No Projects Yet</h1>
          <p className="text-muted-foreground mb-8">
            Start a micro-internship by exploring a career trajectory that matches your skills.
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/trajectories">
              Explore Career Paths <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-300 bg-emerald-500/15 border-emerald-500/20";
      case "submitted": return "text-blue-300 bg-blue-500/15 border-blue-500/20";
      case "in_progress": return "text-amber-300 bg-amber-500/15 border-amber-500/20";
      default: return "text-foreground/70 bg-foreground/5 border-border";
    }
  };

  const handleSaveWork = async () => {
    if (!selectedProject) return;
    try {
      await updateProjectContent({ projectId: selectedProject._id as any, content: workContent });
      toast.success("Progress saved!");
    } catch {
      toast.error("Failed to save work");
    }
  };

  const handleSubmitProject = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      await submitProject({ projectId: selectedProject._id as any });
      toast.success("Project submitted! Generating AI feedback...");
    } catch {
      toast.error("Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = async () => {
    if (!selectedProject || !chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setIsThinking(true);
    try {
      await sendMessage({ projectId: selectedProject._id as any, content: msg });
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsThinking(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: "work", label: "Work Area", icon: Target },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "chat", label: "AI Mentor", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Micro Internships</h1>
          <p className="text-muted-foreground text-lg">
            Real-world deliverables, AI mentorship, and portfolio-ready outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => { setSelectedProjectId(project._id); setActiveTab("work"); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProjectId === project._id
                    ? "border-primary/40 bg-primary/8 ring-1 ring-primary/20"
                    : "border-border hover:border-border/60 hover:bg-muted/30"
                }`}
              >
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{project.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{project.role}</p>
                <Badge className={`text-xs border ${getStatusColor(project.status)}`}>
                  {project.status.replace("_", " ")}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* Main Workspace */}
          {selectedProject && (
            <div className="lg:col-span-3 space-y-4">
              {/* Project Header */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl mb-2">{selectedProject.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {selectedProject.brief}
                        </CardDescription>
                      </div>
                      <Badge className={`shrink-0 border ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* WORK TAB */}
                {activeTab === "work" && (
                  <motion.div
                    key="work"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Task Checklist */}
                    {(selectedProject as any).brief && (
                      <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" /> Deliverables
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {[1, 2, 3, 4].map((n) => (
                              <li key={n} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs text-primary">{n}</span>
                                </div>
                                <span>
                                  {n === 1 && "Complete the primary brief deliverable as described above"}
                                  {n === 2 && "Provide reasoning / justification for your key decisions"}
                                  {n === 3 && "Add at least one real-world example or reference"}
                                  {n === 4 && "Reflect briefly on what you learned from this task"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Work Editor */}
                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Your Submission</CardTitle>
                        <CardDescription>Complete all deliverables above. Be thorough — quality matters for your feedback score.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Start your work here. Address each deliverable clearly, label each section, and be specific. Use plain text, markdown, or bullet points..."
                          value={workContent}
                          onChange={(e) => setWorkContent(e.target.value)}
                          className="min-h-[320px] resize-none text-sm leading-relaxed font-mono"
                          disabled={selectedProject.status === "completed"}
                        />

                        {selectedProject.status !== "completed" && (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {workContent.split(/\s+/).filter(Boolean).length} words
                            </div>
                            <div className="flex gap-3">
                              <Button variant="outline" size="sm" onClick={handleSaveWork} className="rounded-lg">
                                Save Progress
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSubmitProject}
                                disabled={!workContent.trim() || selectedProject.status === "submitted" || isSubmitting}
                                className="rounded-lg"
                              >
                                {isSubmitting ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reviewing...</>
                                ) : (
                                  <><Send className="h-4 w-4 mr-2" /> Submit for Review</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Feedback Panel */}
                    {selectedProject.status === "completed" && feedbackData && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-300">
                              <Award className="h-5 w-5" /> Mentor Feedback
                            </CardTitle>
                            <CardDescription>From: {feedbackData.mentorPersona}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Score */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10">
                              <div className="text-4xl font-bold text-emerald-300">{feedbackData.overallScore}</div>
                              <div className="text-sm">
                                <div className="font-semibold">Overall Score</div>
                                <div className="text-muted-foreground">out of 100</div>
                              </div>
                              <div className="ml-auto grid grid-cols-3 gap-3 text-center">
                                {Object.entries(feedbackData.rubric).map(([key, val]) => (
                                  <div key={key}>
                                    <div className="text-lg font-bold text-emerald-200">{val}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Comments */}
                            <div className="space-y-2">
                              {feedbackData.comments.map((c: any, i: number) => (
                                <div key={i} className={`p-3 rounded-lg text-sm border ${
                                  c.type === "positive" ? "border-emerald-500/20 bg-emerald-500/5"
                                  : c.type === "improvement" ? "border-amber-500/20 bg-amber-500/5"
                                  : "border-blue-500/20 bg-blue-500/5"
                                }`}>
                                  <div className="font-medium mb-0.5">{c.section}</div>
                                  <div className="text-muted-foreground">{c.comment}</div>
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground italic">{feedbackData.generalFeedback}</div>
                            <div className="flex gap-3 pt-2">
                              <Button asChild size="sm" variant="outline" className="rounded-lg">
                                <Link to="/portfolio">View Portfolio</Link>
                              </Button>
                              <Button asChild size="sm" className="rounded-lg">
                                <Link to="/trajectories">
                                  Try a Simulation <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* RESOURCES TAB */}
                {activeTab === "resources" && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" /> Curated Learning Resources
                        </CardTitle>
                        <CardDescription>Handpicked materials to help you complete this project</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProject.resources.map((r: any, i: number) => (
                          <motion.a
                            key={i}
                            href={r.url} target="_blank" rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 transition-all group"
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              r.type === "video" ? "bg-red-500/15" : r.type === "article" ? "bg-blue-500/15" : "bg-green-500/15"
                            }`}>
                              {r.type === "video" && <Play className="h-4 w-4 text-red-400" />}
                              {r.type === "article" && <BookOpen className="h-4 w-4 text-blue-400" />}
                              {r.type === "course" && <Star className="h-4 w-4 text-green-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{r.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </motion.a>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* CHAT TAB */}
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm" style={{ height: "480px", display: "flex", flexDirection: "column" }}>
                      <CardHeader className="shrink-0 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          AI Mentor Chat
                        </CardTitle>
                        <CardDescription>Ask your mentor anything about the project deliverables</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 overflow-hidden p-4 pt-0 gap-3">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                          {(!messages || messages.length === 0) && (
                            <div className="text-center text-muted-foreground text-sm py-8">
                              Your mentor is ready. Ask a question to get started!
                            </div>
                          )}
                          {messages?.map((msg, i) => (
                            <motion.div
                              key={msg._id}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0 }}
                              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "mentor" && (
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                  <Star className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                                  : "bg-white/10 text-foreground rounded-tl-sm"
                              }`}>
                                {msg.content}
                              </div>
                            </motion.div>
                          ))}
                          {isThinking && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              className="flex gap-2 justify-start"
                            >
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                <Star className="h-3 w-3 text-primary" />
                              </div>
                              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/10 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            </motion.div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                        {/* Input */}
                        <div className="flex gap-2 shrink-0">
                          <Input
                            placeholder="Ask your mentor a question..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                            className="rounded-xl"
                            disabled={isThinking}
                          />
                          <Button
                            size="icon"
                            onClick={handleSendChat}
                            disabled={!chatInput.trim() || isThinking}
                            className="rounded-xl shrink-0"
                          >
                            {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}