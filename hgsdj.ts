// Convex Action: scoreSimulationResponse.ts
export const scoreResponse = action({
    args: { response: v.string(), personaContext: v.string() },
    handler: async (ctx, { response, personaContext }) => {
        const prompt = `Score the following response across four dimensions:
    Clarity, Relevance, Confidence, Technical Accuracy (each 0-100).`,
        const result = await gemini.generateContent(prompt);
        return JSON.parse(result.response.text());
    }
});

// Evaluation prompt detailing the 4-dimensional scoring model (0-100)
const prompt = `You are ${args.persona}, a senior expert evaluating a mock interview.
Evaluate each candidate answer on 4 dimensions (0-100 each). 
Be STRICT and HONEST:
- Short answer: 15-30
- Mediocre: 40-60
- Excellent with examples: 80-95

Return ONLY JSON:
{
  "perQuestion": [{"clarity": <0-100>, "relevance": <0-100>, "confidence": <0-100>, "technical": <0-100>}],
  "feedback": "..."
}`;


function fallbackQuestionScore(response: string) {
    const words = response.trim().split(/\s+/).filter(Boolean).length;

    // Mathematical model: base score starts at 22, increases by 1 point per 3 words
    // Capped at 65 to ensure AI is always better than word count
    const base = Math.min(22 + Math.floor(words / 3), 65);

    return {
        clarity: base + 3,
        relevance: base,
        confidence: Math.max(base - 5, 15),
        technical: Math.max(base - 2, 18)
    };
}
// Map industry context to simulated expert personas in src/convex/simulations.ts
const QUESTION_BANKS = {
    Gaming: { persona: "Alex Rivera", title: "Narrative Director @ Naughty Dog" },
    Technology: { persona: "Sarah Chen", title: "Head of UX Strategist @ Figma" },
    Software: { persona: "Marcus Webb", title: "Principal technical Writer @ Stripe" }
};

// Routing logic
const bank = QUESTION_BANKS[trajectory.industry] ?? QUESTION_BANKS.default;