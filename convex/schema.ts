import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  roadmaps: defineTable({
    userId: v.id("users"),
    title: v.string(),
    topic: v.string(),
    status: v.union(
      v.literal("questioning"),
      v.literal("generating"),
      v.literal("ready"),
    ),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
      }),
    ),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.string(),
      }),
    ),
    nodes: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        position: v.object({ x: v.number(), y: v.number() }),
        data: v.object({
          label: v.string(),
          description: v.string(),
          resources: v.array(
            v.object({
              title: v.string(),
              url: v.string(),
            }),
          ),
          completed: v.boolean(),
        }),
      }),
    ),
    edges: v.array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
      }),
    ),
  }).index("by_userId", ["userId"]),
});
