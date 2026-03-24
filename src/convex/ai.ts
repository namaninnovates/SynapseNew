import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_MODEL = "gemini-2.0-flash";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
        },
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    console.error("[Gemini] HTTP error:", res.status, errText.slice(0, 300));
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    console.error("[Gemini] Empty response:", JSON.stringify(data).slice(0, 200));
    throw new Error("Gemini returned empty content");
  }
  return text;
}

/** Extract and parse the first JSON object from a Gemini response (strips markdown fences) */
function parseJSON(raw: string): any {
  const stripped = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response: ${raw.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

// ─── Batch-score ALL interview responses in a SINGLE Gemini call ─────────────
// This avoids rate-limit 429 errors from parallel calls.
export const analyzeAllResponses = action({
  args: {
    persona: v.string(),
    role: v.string(),
    questionsAndResponses: v.array(v.object({
      question: v.string(),
      response: v.string(),
    })),
  },
  handler: async (_ctx, args): Promise<{
    perQuestion: Array<{ clarity: number; relevance: number; confidence: number; technical: number }>;
    overall: number;
    clarity: number;
    relevance: number;
    confidence: number;
    technical: number;
    feedback: string;
  }> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini] No API key — using fallback scores");
      return fallbackAllScores(args.questionsAndResponses);
    }

    const qaPairs = args.questionsAndResponses
      .map((qa, i) => `Q${i + 1}: "${qa.question}"\nAnswer: "${qa.response}"`)
      .join("\n\n");

    const prompt = `You are ${args.persona}, a senior expert evaluating a mock interview for a ${args.role} role.

Evaluate each candidate answer below on 4 dimensions (0-100 each). Be STRICT and HONEST — a one-sentence answer should score 15-30, a mediocre answer 40-60, a good answer with examples 65-80, and an excellent structured answer 80-95. Scores must reflect actual quality.

${qaPairs}

Return ONLY a JSON object with this exact structure (no markdown, no comments):
{
  "perQuestion": [
    {"clarity": <0-100>, "relevance": <0-100>, "confidence": <0-100>, "technical": <0-100>}
  ],
  "feedback": "<3-4 sentences of personalized post-interview feedback addressing the candidate directly. Reference specific things they said. Give one concrete improvement tip.>"
}

The perQuestion array must have exactly ${args.questionsAndResponses.length} entries.`;

    try {
      const raw = await callGemini(apiKey, prompt);
      console.log("[Gemini] analyzeAllResponses raw (first 400):", raw.slice(0, 400));
      const parsed = parseJSON(raw);

      const perQ: Array<{ clarity: number; relevance: number; confidence: number; technical: number }> =
        (parsed.perQuestion ?? []).map((q: any) => ({
          clarity: clamp(q.clarity),
          relevance: clamp(q.relevance),
          confidence: clamp(q.confidence),
          technical: clamp(q.technical),
        }));

      // Ensure we have the right number of entries
      while (perQ.length < args.questionsAndResponses.length) {
        perQ.push(fallbackQuestionScore(args.questionsAndResponses[perQ.length]?.response ?? ""));
      }

      const avg = (key: "clarity" | "relevance" | "confidence" | "technical") =>
        Math.round(perQ.reduce((s, q) => s + q[key], 0) / perQ.length);

      const clarity = avg("clarity");
      const relevance = avg("relevance");
      const confidence = avg("confidence");
      const technical = avg("technical");
      const overall = Math.round((clarity + relevance + confidence + technical) / 4);

      const feedback = typeof parsed.feedback === "string" && parsed.feedback.length > 10
        ? parsed.feedback.trim()
        : fallbackFeedbackText({ overall, clarity, relevance, confidence, technical });

      console.log("[Gemini] Scores — overall:", overall, "clarity:", clarity, "relevance:", relevance, "confidence:", confidence, "technical:", technical);

      return { perQuestion: perQ, overall, clarity, relevance, confidence, technical, feedback };
    } catch (err) {
      console.error("[Gemini] analyzeAllResponses failed:", String(err));
      return fallbackAllScores(args.questionsAndResponses);
    }
  },
});

// ─── AI mentor chat reply (single call, no rate limit concern) ───────────────
export const getMentorReply = action({
  args: {
    projectTitle: v.string(),
    projectBrief: v.string(),
    role: v.string(),
    workContent: v.string(),
    messageHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("mentor")),
      content: v.string(),
    })),
    userMessage: v.string(),
  },
  handler: async (_ctx, args): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini] No API key — using fallback mentor reply");
      return fallbackMentorReply(args.messageHistory.length);
    }

    const historyContext = args.messageHistory
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`)
      .join("\n");

    const workPreview = args.workContent
      ? `\n\nStudent's current draft:\n"""\n${args.workContent.slice(0, 500)}\n"""`
      : "";

    const prompt = `You are an expert ${args.role} with 10+ years of industry experience acting as a career mentor.

Project: "${args.projectTitle}"
Brief: "${args.projectBrief}"${workPreview}

Conversation:
${historyContext || "(first message)"}

Student: "${args.userMessage}"

Reply as the mentor. Be specific, practical, and encouraging. Reference the project brief or their work content where relevant. Keep to 2-4 sentences. No label prefix.`;

    try {
      const reply = await callGemini(apiKey, prompt);
      console.log("[Gemini] getMentorReply success, chars:", reply.length);
      return reply.trim().replace(/^(Mentor:|AI Mentor:|Assistant:)\s*/i, "");
    } catch (err) {
      console.error("[Gemini] getMentorReply failed:", String(err));
      return fallbackMentorReply(args.messageHistory.length);
    }
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clamp(n: unknown): number {
  return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}

function fallbackQuestionScore(response: string) {
  const words = response.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.min(22 + Math.floor(words / 3), 65);
  return { clarity: base + 3, relevance: base, confidence: Math.max(base - 5, 15), technical: Math.max(base - 2, 18) };
}

function fallbackAllScores(qas: Array<{ question: string; response: string }>) {
  const perQuestion = qas.map((qa) => fallbackQuestionScore(qa.response));
  const avg = (key: "clarity" | "relevance" | "confidence" | "technical") =>
    Math.round(perQuestion.reduce((s, q) => s + q[key], 0) / perQuestion.length);
  const clarity = avg("clarity"); const relevance = avg("relevance");
  const confidence = avg("confidence"); const technical = avg("technical");
  const overall = Math.round((clarity + relevance + confidence + technical) / 4);
  return { perQuestion, overall, clarity, relevance, confidence, technical, feedback: fallbackFeedbackText({ overall, clarity, relevance, confidence, technical }) };
}

function fallbackMentorReply(msgCount: number) {
  const replies = [
    "Great question! Think about how the end user will experience this — that perspective often unlocks the best approach.",
    "Good thinking. Back it up with a specific real-world example to make it portfolio-worthy.",
    "You're on the right track. Consider the business impact, not just the craft quality.",
    "Almost there! Tie your conclusion back to the project brief to show you've addressed the core objective.",
  ];
  return replies[Math.min(Math.floor(msgCount / 2), replies.length - 1)];
}

function fallbackFeedbackText(score: { overall: number; clarity: number; relevance: number; confidence: number; technical: number }) {
  type ScoreKey = "clarity" | "relevance" | "confidence" | "technical";
  const keys: ScoreKey[] = ["clarity", "relevance", "confidence", "technical"];
  const weakest = keys.slice().sort((a: ScoreKey, b: ScoreKey) => score[a] - score[b])[0];
  const level = score.overall >= 75 ? "strong" : score.overall >= 55 ? "solid" : "developing";
  return `You showed ${level} potential in this session. Your scores reflect the depth and specificity of your responses — the area with the most room to grow is ${weakest}. Practice using the STAR method (Situation, Task, Action, Result) to structure future answers more effectively.`;
}
