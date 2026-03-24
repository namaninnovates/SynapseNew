import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Mic, MicOff, VideoOff, ChevronRight, Award,
  TrendingUp, Loader2, ArrowRight, CheckCircle2, Play,
  RotateCcw, Star, Brain, Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";

type Phase = "setup" | "interview" | "scorecard";

// ─── NLP-based local scoring ────────────────────────────────────────────────
const FILLER_WORDS = new Set([
  "um", "uh", "like", "basically", "literally", "honestly", "actually", "sort of",
  "kind of", "you know", "i mean", "so yeah", "right", "okay so",
]);

const EXAMPLE_SIGNALS = [
  /\bfor (example|instance)\b/i,
  /\bsuch as\b/i,
  /\bwhen i\b/i,
  /\bat my (previous|last|current)\b/i,
  /\bin my (experience|role|last|previous)\b/i,
  /\bspecifically\b/i,
  /\bone (time|project|case|situation)\b/i,
  /\bwe (built|launched|shipped|delivered|implemented)\b/i,
];

const STRUCTURING_SIGNALS = [
  /\bfirst(ly)?\b/i, /\bsecond(ly)?\b/i, /\bthird(ly)?\b/i,
  /\bfinally\b/i, /\bmoreover\b/i, /\badditionally\b/i,
  /\bin (conclusion|summary)\b/i, /\bto summarize\b/i,
  /\bthe result was\b/i, /\bthe outcome\b/i, /\bthis led to\b/i,
];

function analyzeResponse(text: string, question: string): {
  clarity: number; relevance: number; confidence: number; technical: number;
} {
  if (!text || text.trim().length < 5) {
    return { clarity: 22, relevance: 18, confidence: 15, technical: 20 };
  }

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const uniqueWords = new Set(words).size;
  const uniqueRatio = uniqueWords / Math.max(wordCount, 1);

  // Filler word penalty
  const fillerCount = words.filter((w) => FILLER_WORDS.has(w)).length;
  const fillerPenalty = Math.min(fillerCount * 3, 20);

  // Example usage bonus
  const exampleCount = EXAMPLE_SIGNALS.filter((re) => re.test(text)).length;
  const exampleBonus = Math.min(exampleCount * 8, 24);

  // Structuring bonus
  const structureCount = STRUCTURING_SIGNALS.filter((re) => re.test(text)).length;
  const structureBonus = Math.min(structureCount * 5, 15);

  // Avg sentence length (ideal: 12-22 words)
  const avgSentenceLen = wordCount / Math.max(sentences.length, 1);
  const sentenceScore = avgSentenceLen >= 10 && avgSentenceLen <= 28 ? 15 : avgSentenceLen < 5 ? 0 : 8;

  // Word count depth score (0-25)
  const depthScore =
    wordCount < 20 ? 5 :
    wordCount < 50 ? 12 :
    wordCount < 100 ? 20 :
    wordCount < 200 ? 24 : 25;

  // Lexical diversity score (0-20)
  const lexicalScore = Math.round(uniqueRatio * 20);

  // Relevance: keyword overlap between response and question
  const questionWords = new Set(
    question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const responseWords = new Set(
    text.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );
  const overlap = [...questionWords].filter((w) => responseWords.has(w)).length;
  const relevanceBoost = Math.min(overlap * 6, 30);

  // BASE scores from content quality
  const baseClarity = 35 + depthScore + sentenceScore + Math.round(lexicalScore * 0.5) - fillerPenalty + structureBonus;
  const baseRelevance = 30 + relevanceBoost + exampleBonus + depthScore * 0.6;
  const baseConfidence = 32 + exampleBonus * 0.8 + structureBonus + depthScore * 0.7 - fillerPenalty * 0.5;
  const baseTechnical = 28 + lexicalScore + depthScore + relevanceBoost * 0.6 + exampleBonus * 0.5;

  // Clamp to [25, 97]
  const clamp = (n: number) => Math.max(25, Math.min(97, Math.round(n)));

  return {
    clarity: clamp(baseClarity),
    relevance: clamp(baseRelevance),
    confidence: clamp(baseConfidence),
    technical: clamp(baseTechnical),
  };
}

function aggregateScores(
  responses: { questionIndex: number; responseText: string }[],
  questions: string[]
): { overall: number; clarity: number; relevance: number; confidence: number; technical: number } {
  if (responses.length === 0) {
    return { overall: 22, clarity: 22, relevance: 22, confidence: 22, technical: 22 };
  }

  const all = responses.map((r) =>
    analyzeResponse(r.responseText, questions[r.questionIndex] ?? "")
  );

  const avg = (key: keyof typeof all[0]) =>
    Math.round(all.reduce((s, d) => s + d[key], 0) / all.length);

  const clarity = avg("clarity");
  const relevance = avg("relevance");
  const confidence = avg("confidence");
  const technical = avg("technical");
  const overall = Math.round((clarity + relevance + confidence + technical) / 4);

  return { overall, clarity, relevance, confidence, technical };
}

function buildFeedback(
  name: string,
  score: ReturnType<typeof aggregateScores>,
  responses: { questionIndex: number; responseText: string }[]
): string {
  const avg = score.overall;
  const weakest = ([
    "clarity", "relevance", "confidence", "technical"
  ] as Array<"clarity" | "relevance" | "confidence" | "technical">).slice().sort(
    (a, b) => score[a] - score[b]
  )[0];

  const weakHints: Record<string, string> = {
    clarity: "Focus on structuring your answers with clear beginning, middle, and end.",
    relevance: "Make sure each answer directly addresses the question asked.",
    confidence: "Use specific examples and avoid filler words to sound more assured.",
    technical: "Incorporate domain-specific terms and real-world cases to demonstrate depth.",
  };

  const totalWords = responses.reduce(
    (s, r) => s + r.responseText.split(/\s+/).filter(Boolean).length, 0
  );

  return [
    avg >= 80
      ? `Excellent performance, ${name}! Your responses showed strong depth and engagement.`
      : avg >= 60
      ? `Solid attempt, ${name}. You demonstrated clear thinking with room to sharpen your delivery.`
      : `Good effort, ${name}. With more structured responses, your scores will improve significantly.`,
    `You answered ${responses.length} question${responses.length !== 1 ? "s" : ""} with an average of ${Math.round(totalWords / Math.max(responses.length, 1))} words each.`,
    `Your strongest area was ${([
      "clarity", "relevance", "confidence", "technical"
    ] as Array<"clarity" | "relevance" | "confidence" | "technical">).slice().sort((a, b) => score[b] - score[a])[0]}.`,
    weakHints[weakest],
    "Practice using the STAR method (Situation, Task, Action, Result) to ace your next round.",
  ].join(" ");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Simulation() {
  // Local fallback used only when Gemini API call fails
  const fallbackScore = (text: string) => {
    const w = text.trim().split(/\s+/).filter(Boolean).length;
    const base = Math.min(30 + Math.floor(w / 4), 72);
    return { clarity: base + 3, relevance: base, confidence: base - 4, technical: base - 2, rationale: "" };
  };

  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trajectoryId = searchParams.get("trajectoryId") as any;

  const createSimulation = useMutation(api.simulations.createSimulation);
  const submitResponse = useMutation(api.simulations.submitSimulationResponse);
  const completeSimulation = useMutation(api.simulations.completeSimulation);
  const analyzeAllResponses = useAction(api.ai.analyzeAllResponses);

  const [simId, setSimId] = useState<string | null>(null);
  const simulation = useQuery(
    api.simulations.getSimulation,
    simId ? { simulationId: simId as any } : "skip"
  );

  const [phase, setPhase] = useState<Phase>("setup");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [allResponses, setAllResponses] = useState<{ questionIndex: number; responseText: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState<{ overall: number; clarity: number; relevance: number; confidence: number; technical: number } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setupVideoRef = useRef<HTMLVideoElement>(null);
  const interviewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Re-attach stream when video element changes (phase transition)
  const attachStream = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const el = phase === "setup" ? setupVideoRef.current : interviewVideoRef.current;
    if (el && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [phase]);

  useEffect(() => {
    // Small delay to let AnimatePresence finish rendering the new element
    const t = setTimeout(attachStream, 80);
    return () => clearTimeout(t);
  }, [phase, cameraOn, attachStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micOn });
      streamRef.current = stream;
      const el = phase === "setup" ? setupVideoRef.current : interviewVideoRef.current;
      if (el) { el.srcObject = stream; el.play().catch(() => {}); }
      setCameraOn(true);
    } catch {
      toast.error("Camera access denied — you can still use text-only responses.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (setupVideoRef.current) setupVideoRef.current.srcObject = null;
    if (interviewVideoRef.current) interviewVideoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const startTimer = () => {
    setTimeLeft(90);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const startInterview = async () => {
    if (!trajectoryId) { toast.error("No trajectory selected."); return; }
    setIsSubmitting(true);
    try {
      const id = await createSimulation({ trajectoryId });
      setSimId(id);
      setAllResponses([]);
      setPhase("interview");
      setQuestionIndex(0);
      startTimer();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to start simulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!simId || !simulation) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const thisResponse = response.trim() || "(No response given)";
    const newResponses = [...allResponses, { questionIndex, responseText: thisResponse }];
    setAllResponses(newResponses);

    try {
      // Store raw response in Convex
      await submitResponse({ simulationId: simId as any, questionIndex, responseText: thisResponse });

      const nextIndex = questionIndex + 1;
      if (nextIndex >= simulation.questions.length) {
        // ── Single batched Gemini call: scores ALL responses + feedback at once ──
        toast.info("Gemini is analyzing your responses...", { duration: 8000 });
        const result = await analyzeAllResponses({
          persona: simulation.persona,
          role: simulation.personaTitle ?? simulation.persona,
          questionsAndResponses: newResponses.map((r) => ({
            question: simulation.questions[r.questionIndex],
            response: r.responseText,
          })),
        });

        const computed = {
          overall: result.overall,
          clarity: result.clarity,
          relevance: result.relevance,
          confidence: result.confidence,
          technical: result.technical,
        };

        // Persist to Convex
        await completeSimulation({ simulationId: simId as any, clientScore: computed, clientFeedback: result.feedback });
        setScore(computed);
        setFeedbackText(result.feedback);
        setPhase("scorecard");
        stopCamera();
      } else {
        setQuestionIndex(nextIndex);
        setResponse("");
        startTimer();
      }
    } catch (err) {
      console.error("handleSubmitResponse error:", err);
      toast.error("Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const radarData = score
    ? [
        { dimension: "Clarity", value: score.clarity },
        { dimension: "Relevance", value: score.relevance },
        { dimension: "Confidence", value: score.confidence },
        { dimension: "Technical", value: score.technical },
      ]
    : [];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!trajectoryId && phase === "setup") {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Video className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Video Simulation</h1>
          <p className="text-muted-foreground mb-8">
            Start a simulation from a career trajectory that matches your profile.
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/trajectories">Choose a Career Path <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* ── SETUP ── */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-3">1-on-1 Career Simulation</h1>
                <p className="text-muted-foreground text-lg">A mock interview with an AI industry mentor. 5 questions, ~10 minutes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Video, title: "Real Interview Feel", desc: "Camera + mic for an immersive experience" },
                  { icon: Brain, title: "AI Interviewer", desc: "Industry-expert persona tailored to your career path" },
                  { icon: Award, title: "Smart Scorecard", desc: "NLP-powered analysis of your actual responses" },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-semibold mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>Set Up Your Environment</CardTitle>
                  <CardDescription>Enable camera/mic for the best experience (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10 relative flex items-center justify-center">
                    <video
                      ref={setupVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover scale-x-[-1] transition-opacity ${cameraOn ? "opacity-100" : "opacity-0 absolute"}`}
                    />
                    {!cameraOn && (
                      <div className="text-center text-muted-foreground">
                        <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Camera off</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={cameraOn ? stopCamera : startCamera}>
                      {cameraOn ? <><VideoOff className="h-4 w-4 mr-2" /> Disable</> : <><Video className="h-4 w-4 mr-2" /> Enable Camera</>}
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setMicOn(!micOn)}>
                      {micOn ? <><Mic className="h-4 w-4 mr-2" /> Mic On</> : <><MicOff className="h-4 w-4 mr-2" /> Mic Off</>}
                    </Button>
                  </div>
                  <Button size="lg" className="w-full rounded-xl" onClick={startInterview} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...</> : <><Play className="h-4 w-4 mr-2" /> Start Interview</>}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── INTERVIEW ── */}
          {phase === "interview" && simulation && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Question {questionIndex + 1} of {simulation.questions.length}</div>
                <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${timeLeft <= 30 ? "text-red-400 bg-red-400/10" : "text-primary bg-primary/10"}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </div>
              </div>
              <Progress value={(questionIndex / simulation.questions.length) * 100} className="h-1.5 rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {/* Interviewer + Camera */}
                <div className="md:col-span-2 space-y-4">
                  <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                        <Star className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{simulation.persona}</div>
                        <div className="text-xs text-muted-foreground">{simulation.personaTitle}</div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400">Live</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Camera preview */}
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10 relative flex items-center justify-center">
                    <video
                      ref={interviewVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover scale-x-[-1] transition-opacity ${cameraOn ? "opacity-100" : "opacity-0 absolute"}`}
                    />
                    {!cameraOn && (
                      <div className="text-center text-muted-foreground text-xs">
                        <VideoOff className="h-6 w-6 mx-auto mb-1 opacity-30" />
                        <span>You</span>
                      </div>
                    )}
                    {cameraOn && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs bg-black/60 text-white/80">You</div>
                    )}
                  </div>
                </div>

                {/* Question + Response */}
                <div className="md:col-span-3 space-y-4">
                  <motion.div key={questionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
                      <CardContent className="pt-5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-lg font-medium leading-relaxed">{simulation.questions[questionIndex]}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardContent className="pt-5 space-y-3">
                      <Textarea
                        placeholder="Type your response here. Use specific examples and the STAR method (Situation, Task, Action, Result) for a higher score…"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="min-h-[200px] resize-none text-sm"
                      />
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {response.split(/\s+/).filter(Boolean).length} words
                          <span className="ml-2 opacity-50">· AI will score after submission</span>
                        </div>
                        <Button onClick={handleSubmitResponse} disabled={isSubmitting} className="rounded-xl">
                          {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
                          ) : questionIndex < simulation.questions.length - 1 ? (
                            <>Next Question <ChevronRight className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>Finish Session <CheckCircle2 className="h-4 w-4 ml-1" /></>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SCORECARD ── */}
          {phase === "scorecard" && score && simulation && (
            <motion.div key="scorecard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Session Complete!</h1>
                <p className="text-muted-foreground">Gemini AI scorecard for your session with {simulation.persona}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-6">
                    <div className={`text-6xl font-extrabold tabular-nums ${score.overall >= 75 ? "text-emerald-400" : score.overall >= 55 ? "text-amber-400" : "text-rose-400"}`}>
                      {score.overall}
                    </div>
                    <div className="space-y-2 flex-1">
                      {(["clarity", "relevance", "confidence", "technical"] as const).map((key) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-muted-foreground">{key}</span>
                            <span className="font-medium">{score[key]}</span>
                          </div>
                          <Progress value={score[key]} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader><CardTitle className="text-base">Performance Radar</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {feedbackText && (
                <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400" /> AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-muted-foreground leading-relaxed">{feedbackText}</p></CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate(0)}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
                <Button asChild className="rounded-xl">
                  <Link to="/projects"><TrendingUp className="h-4 w-4 mr-2" /> Start a Micro Internship</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
