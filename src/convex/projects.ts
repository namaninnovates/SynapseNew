import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getCurrentUser } from "./users";

// Role-specific project briefs
const PROJECT_TEMPLATES: Record<string, {
  title: string; brief: string; role: string;
  tasks: string[];
  resources: { title: string; url: string; type: "video" | "article" | "course" }[];
}[]> = {
  Gaming: [{
    title: "Design a Game Opening Scene",
    brief: "You've been assigned as the narrative lead on a new indie RPG. Your task is to write and design the opening scene that hooks the player, establishes the world, and introduces the protagonist's core conflict. The scene must work both as prose and as practical game dialogue.",
    role: "Narrative Designer",
    tasks: [
      "Write a 200-word world-setting introduction (shown as an in-game book or text overlay)",
      "Draft the protagonist's opening monologue (internal voice-over, max 5 lines)",
      "Design a 3-choice dialogue tree for the first NPC interaction",
      "Describe 2 environmental storytelling details the player can discover",
    ],
    resources: [
      { title: "Game Narrative Design Masterclass", url: "https://www.youtube.com/watch?v=ILECZh5bsZc", type: "video" },
      { title: "Writing for Games: Environmental Storytelling", url: "https://www.gamedeveloper.com/design/environmental-storytelling-in-games", type: "article" },
      { title: "Narrative Design Fundamentals (Coursera)", url: "https://www.coursera.org/learn/game-design", type: "course" },
    ],
  }],
  Technology: [{
    title: "Redesign a Complex User Onboarding Flow",
    brief: "A SaaS company's analytics dashboard has a 68% drop-off rate in its 5-step onboarding flow. You've been brought in as UX Content Strategist to rewrite all in-product copy for the onboarding experience — tooltips, modals, empty states, and progress indicators.",
    role: "UX Content Strategist",
    tasks: [
      "Rewrite the welcome modal headline and body (max 30 words)",
      "Write tooltip copy for 3 core dashboard features",
      "Design the empty state message for a user with no data yet",
      "Create a 4-step progress indicator with motivational micro-copy",
    ],
    resources: [
      { title: "Writing UX Copy That Works", url: "https://www.nngroup.com/articles/microcopy/", type: "article" },
      { title: "UX Writing: Creating Microcopy", url: "https://www.youtube.com/watch?v=n6GJh61hnLY", type: "video" },
      { title: "UX Writing Hub Course", url: "https://uxwritinghub.com/ux-writing-course/", type: "course" },
    ],
  }],
  Software: [{
    title: "Write API Integration Documentation",
    brief: "You're the technical writer for a fintech startup that just shipped a REST payment API. Write the Getting Started guide for developers who want to integrate the API into their apps in under 30 minutes.",
    role: "Technical Writer",
    tasks: [
      "Write an overview section explaining what the API does and who it's for",
      "Create a 'Quick Start in 5 Steps' walking through auth + first API call",
      "Document 2 sample requests and their expected responses (JSON format)",
      "Write an error handling section covering 3 common error codes",
    ],
    resources: [
      { title: "How to Write API Documentation", url: "https://www.youtube.com/watch?v=PO71qVRH_Hc", type: "video" },
      { title: "Stripe API Docs Best Practices", url: "https://stripe.com/docs", type: "article" },
      { title: "Technical Writing One (Google)", url: "https://developers.google.com/tech-writing/one", type: "course" },
    ],
  }],
  Marketing: [{
    title: "Build a Content Strategy for a New Product Launch",
    brief: "A wellness app is launching in 3 months. You're the Content Marketing Manager. Build a 60-day pre-launch content strategy that grows awareness, builds an email list of 1,000 subscribers, and drives 500 app waitlist sign-ups.",
    role: "Content Marketing Manager",
    tasks: [
      "Define 3 content pillars and explain why each fits the brand",
      "Create a 4-week editorial calendar with 3 posts per week (channel + topic + format)",
      "Write a 150-word email opt-in lead magnet description",
      "Propose 2 influencer/creator partnership ideas with rationale",
    ],
    resources: [
      { title: "Content Marketing Strategy Framework", url: "https://www.youtube.com/watch?v=Bes0skOJaK8", type: "video" },
      { title: "HubSpot's Content Marketing Certification", url: "https://academy.hubspot.com/courses/content-marketing", type: "course" },
      { title: "Building a Content Calendar", url: "https://blog.hubspot.com/marketing/editorial-calendar-tools", type: "article" },
    ],
  }],
};

const MENTOR_RESPONSES: Record<number, string[]> = {
  0: [
    "Excellent start! You're showing real initiative — that's exactly what we look for.",
    "Good thinking. Let's dig a bit deeper into this aspect.",
    "That's a solid foundation. Consider how this connects to the user's emotional journey.",
  ],
  1: [
    "I like where you're going with this. Make sure to back it up with concrete examples.",
    "Nice approach! Think about edge cases — what happens when things don't go as planned?",
    "Good work. In a real team setting, you'd also want to validate this with data.",
  ],
  2: [
    "You're making strong progress! This is the kind of thinking that stands out in portfolios.",
    "Creative choice! Explain your reasoning so the team can follow your logic.",
    "This is coming together well. Polish this section and it'll be portfolio-ready.",
  ],
  3: [
    "Excellent! You've shown a real understanding of the craft. Final touches will elevate this.",
    "Nearly there — great thinking throughout. Tie everything together in your conclusion.",
    "Outstanding work on this deliverable. Your analytical approach is impressive.",
  ],
};

function getMentorResponse(messageIndex: number): string {
  const bucket = Math.min(Math.floor(messageIndex / 2), 3);
  const arr = MENTOR_RESPONSES[bucket];
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) return null;
    return project;
  },
});

export const getProjectMessages = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("projectMessages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Action: sends a user message and gets a real AI mentor reply via Gemini
export const sendProjectMessage = action({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const userId = await ctx.runMutation(api.projects.insertUserMessage, {
      projectId: args.projectId,
      content: args.content,
    });
    if (!userId) return;

    // Fetch project + message history for context
    const project = await ctx.runQuery(api.projects.getProject, { projectId: args.projectId });
    const messages = await ctx.runQuery(api.projects.getProjectMessages, { projectId: args.projectId });
    if (!project) return;

    // Call real Gemini AI for mentor reply
    const reply = await ctx.runAction(api.ai.getMentorReply, {
      projectTitle: project.title,
      projectBrief: project.brief,
      role: project.role,
      workContent: project.workContent ?? "",
      messageHistory: messages.map((m: any) => ({ role: m.role, content: m.content })),
      userMessage: args.content,
    });

    // Store mentor reply
    await ctx.runMutation(api.projects.insertMentorMessage, {
      projectId: args.projectId,
      content: reply,
    });
  },
});

// Internal mutations for message insertion (called by the action above)
export const insertUserMessage = mutation({
  args: { projectId: v.id("projects"), content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) return null;
    await ctx.db.insert("projectMessages", {
      projectId: args.projectId,
      userId: user._id,
      role: "user" as const,
      content: args.content,
    });
    return user._id;
  },
});

export const insertMentorMessage = mutation({
  args: { projectId: v.id("projects"), content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;
    await ctx.db.insert("projectMessages", {
      projectId: args.projectId,
      userId: user._id,
      role: "mentor" as const,
      content: args.content,
    });
  },
});

export const createProject = mutation({
  args: {
    trajectoryId: v.id("trajectories"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const trajectory = await ctx.db.get(args.trajectoryId);
    if (!trajectory || trajectory.userId !== user._id) throw new Error("Trajectory not found");

    const templates = PROJECT_TEMPLATES[trajectory.industry] ?? PROJECT_TEMPLATES.Gaming;
    const template = templates[0];

    // Check if project for this trajectory already exists
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const dupe = existing.find((p) => p.trajectoryId === args.trajectoryId);
    if (dupe) return dupe._id;

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      trajectoryId: args.trajectoryId,
      title: template.title,
      brief: template.brief,
      role: template.role,
      status: "not_started",
      resources: template.resources,
    });

    // Seed an opening mentor message
    await ctx.db.insert("projectMessages", {
      projectId,
      userId: user._id,
      role: "mentor",
      content: `Welcome to your micro-internship! I'm ${trajectory.industry === "Gaming" ? "Jordan" : trajectory.industry === "Technology" ? "Sarah" : trajectory.industry === "Software" ? "Marcus" : "Priya"}, your mentor for this project. Feel free to ask me anything as you work through the deliverables. Let's build something portfolio-worthy! 🚀`,
    });

    return projectId;
  },
});

export const updateProjectContent = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Project not found");
    await ctx.db.patch(args.projectId, {
      workContent: args.content,
      status: "in_progress",
    });
  },
});

export const submitProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Project not found");

    await ctx.db.patch(args.projectId, {
      status: "submitted",
      submittedAt: Date.now(),
    });

    // Content-aware scoring
    const wordCount = (project.workContent ?? "").split(/\s+/).filter(Boolean).length;
    const clarityScore = Math.min(70 + Math.floor(wordCount / 8), 95);
    const creativityScore = Math.min(72 + Math.floor(wordCount / 10), 97);
    const accuracyScore = Math.min(68 + Math.floor(wordCount / 9), 93);
    const overall = Math.round((clarityScore + creativityScore + accuracyScore) / 3);

    await ctx.db.insert("feedback", {
      projectId: args.projectId,
      userId: user._id,
      overallScore: overall,
      rubric: { clarity: clarityScore, creativity: creativityScore, accuracy: accuracyScore },
      comments: [
        {
          section: "Deliverable Quality",
          comment: wordCount > 100
            ? "Strong depth — your work shows real engagement with the brief."
            : "Good start! Adding more detail to each deliverable will strengthen your submission.",
          type: "positive" as const,
        },
        {
          section: "Structure & Clarity",
          comment: "Ensure each task is clearly labelled so reviewers can follow your thinking.",
          type: "improvement" as const,
        },
        {
          section: "Bonus Tips",
          comment: "Consider adding a brief reflection on what you learned from this project.",
          type: "suggestion" as const,
        },
      ],
      generalFeedback: `Overall score: ${overall}/100. Your submission demonstrates ${overall >= 85 ? "excellent" : overall >= 75 ? "solid" : "developing"} skills for the ${project.role} role. Focus on deepening your examples and tying deliverables back to user or business outcomes for an even stronger portfolio piece.`,
      nextSteps: [
        "Export this project to your Portfolio",
        "Attempt a Video Simulation interview for this career path",
        "Explore the next trajectory on your dashboard",
      ],
      mentorPersona: `Senior ${project.role} with 10+ years of industry experience`,
    });

    await ctx.db.patch(args.projectId, { status: "completed" });
  },
});

export const getFeedback = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const rows = await ctx.db
      .query("feedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return rows[0] ?? null;
  },
});

