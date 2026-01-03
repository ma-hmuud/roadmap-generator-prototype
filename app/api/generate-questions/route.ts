import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { questionsSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const { topic } = await req.json();

  if (!topic || typeof topic !== "string") {
    return new Response("Topic is required", { status: 400 });
  }

  const result = streamObject({
    model: google("gemini-3-flash-preview"),
    schema: questionsSchema,
    prompt: `You are an expert learning path designer. A user wants to learn about: "${topic}"

Generate 3-5 clarifying questions to understand:
1. Their current experience level with this topic
2. Their specific goals or areas of interest within this topic
3. How much time they can dedicate to learning
4. Their preferred learning style (videos, reading, hands-on projects)
5. Any prerequisites or related skills they already have

Make the questions specific to the topic "${topic}" and conversational in tone.
Each question should help you create a more personalized learning roadmap.`,
  });

  return result.toTextStreamResponse();
}
