import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

// Interview question banks per industry
const QUESTION_BANKS: Record<string, { persona: string; personaTitle: string; questions: string[] }> = {
  Gaming: {
    persona: "Alex Rivera",
    personaTitle: "Senior Narrative Director @ Naughty Dog",
    questions: [
      "Tell me about yourself and why you're passionate about the gaming industry.",
      "Walk me through your creative process when developing a character's backstory.",
      "How would you handle creative disagreements with a game designer?",
      "Describe a time you had to adapt your storytelling approach to fit technical constraints.",
      "Where do you see narrative design heading in the next five years?",
    ],
  },
  Technology: {
    persona: "Sarah Chen",
    personaTitle: "Head of UX Content Strategy @ Figma",
    questions: [
      "Tell me about yourself and your journey into UX content strategy.",
      "How do you approach writing microcopy for complex user flows?",
      "Describe a project where your content decisions measurably improved user outcomes.",
      "How do you collaborate with designers and engineers?",
      "What frameworks do you use to prioritize content work?",
    ],
  },
  Software: {
    persona: "Marcus Webb",
    personaTitle: "Principal Technical Writer @ Stripe",
    questions: [
      "Walk me through your background and what draws you to technical writing.",
      "How do you make complex API documentation accessible for beginners?",
      "Describe your process for keeping documentation up to date in a fast-moving codebase.",
      "How do you collaborate with engineering teams to validate accuracy?",
      "What documentation tools and formats do you prefer and why?",
    ],
  },
  Marketing: {
    persona: "Priya Patel",
    personaTitle: "VP of Content Marketing @ HubSpot",
    questions: [
      "Tell me about yourself and your content marketing philosophy.",
      "How do you build a content strategy from scratch for a new product?",
      "describe a content campaign you led and its measurable impact.",
      "How do you balance creativity with data-driven decision making?",
      "What does the future of content marketing look like to you?",
    ],
  },
  default: {
    persona: "Jordan Blake",
    personaTitle: "Career Coach & Industry Mentor",
    questions: [
      "Tell me about yourself and what you're looking for in your next role.",
      "What are your greatest professional strengths?",
      "Describe a challenge you overcame and what you learned from it.",
      "Where do you see yourself in five years?",
      "Do you have any questions for me?",
    ],
  },
};

export const createSimulation = mutation({
  args: { trajectoryId: v.id("trajectories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const trajectory = await ctx.db.get(args.trajectoryId);
    if (!trajectory || trajectory.userId !== user._id) throw new Error("Trajectory not found");

    const bank = QUESTION_BANKS[trajectory.industry] ?? QUESTION_BANKS.default;

    return await ctx.db.insert("simulations", {
      userId: user._id,
      trajectoryId: args.trajectoryId,
      persona: bank.persona,
      personaTitle: bank.personaTitle,
      questions: bank.questions,
      responses: [],
      status: "in_progress",
    });
  },
});

export const getSimulation = query({
  args: { simulationId: v.id("simulations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const sim = await ctx.db.get(args.simulationId);
    if (!sim || sim.userId !== user._id) return null;
    return sim;
  },
});

export const getUserSimulations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("simulations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const submitSimulationResponse = mutation({
  args: {
    simulationId: v.id("simulations"),
    questionIndex: v.number(),
    responseText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sim = await ctx.db.get(args.simulationId);
    if (!sim || sim.userId !== user._id) throw new Error("Simulation not found");

    const responses = [...sim.responses, {
      questionIndex: args.questionIndex,
      responseText: args.responseText,
    }];

    await ctx.db.patch(args.simulationId, { responses });
  },
});

export const completeSimulation = mutation({
  args: {
    simulationId: v.id("simulations"),
    clientScore: v.optional(v.object({
      overall: v.number(),
      clarity: v.number(),
      relevance: v.number(),
      confidence: v.number(),
      technical: v.number(),
    })),
    clientFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sim = await ctx.db.get(args.simulationId);
    if (!sim || sim.userId !== user._id) throw new Error("Simulation not found");

    // Use client-computed NLP score if provided, otherwise fall back to simple heuristic
    const score = args.clientScore ?? (() => {
      const numResponses = sim.responses.length;
      const avgLen = numResponses > 0
        ? sim.responses.reduce((s, r) => s + r.responseText.split(/\s+/).filter(Boolean).length, 0) / numResponses
        : 0;
      const base = Math.min(35 + numResponses * 5 + Math.min(Math.floor(avgLen / 5), 30), 75);
      return { overall: base, clarity: base - 2, relevance: base + 1, confidence: base - 4, technical: base - 1 };
    })();

    const feedback = args.clientFeedback ?? "Session completed. Practice more to improve your scores.";

    await ctx.db.patch(args.simulationId, {
      status: "completed",
      score,
      feedback,
    });

    return score;
  },
});

