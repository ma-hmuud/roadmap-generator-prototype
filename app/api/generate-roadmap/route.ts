import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { roadmapSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const { topic, answers } = await req.json();

  if (!topic || typeof topic !== "string") {
    return new Response("Topic is required", { status: 400 });
  }

  if (!answers || !Array.isArray(answers)) {
    return new Response("Answers are required", { status: 400 });
  }

  const answersText = answers
    .map(
      (a: { question: string; answer: string }) =>
        `Q: ${a.question}\nA: ${a.answer}`,
    )
    .join("\n\n");

  const result = streamObject({
    model: google("gemini-3-flash-preview"),
    schema: roadmapSchema,
    prompt: `You are an expert learning path designer. Create a comprehensive learning roadmap for: "${topic}"

Based on the user's responses:
${answersText}

Create a structured roadmap with:
1. A clear, concise title for the roadmap
2. 8-12 learning nodes (steps) that build upon each other
3. Each node should have:
   - A short label (2-4 words)
   - A detailed description explaining what to learn
   - 2-4 high-quality resources (official docs, tutorials, courses)
4. Edges connecting nodes in a logical learning progression

Consider:
- Start with fundamentals and progress to advanced topics
- Include practical projects or exercises where appropriate
- Provide a mix of free and premium resources
- Ensure resources are from reputable sources (official docs, well-known platforms)

The roadmap should be personalized based on the user's experience level and goals.`,
  });

  return result.toTextStreamResponse();
}
