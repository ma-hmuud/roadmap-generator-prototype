import {
  query,
  mutation,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Validators for reuse
const questionValidator = v.object({
  id: v.string(),
  question: v.string(),
});

const answerValidator = v.object({
  questionId: v.string(),
  answer: v.string(),
});

const resourceValidator = v.object({
  title: v.string(),
  url: v.string(),
});

const nodeDataValidator = v.object({
  label: v.string(),
  description: v.string(),
  resources: v.array(resourceValidator),
  completed: v.boolean(),
});

const nodeValidator = v.object({
  id: v.string(),
  type: v.string(),
  position: v.object({ x: v.number(), y: v.number() }),
  data: nodeDataValidator,
});

const edgeValidator = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
});

/**
 * Create a new roadmap with initial topic
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    topic: v.string(),
  },
  returns: v.id("roadmaps"),
  handler: async (ctx, args) => {
    const roadmapId = await ctx.db.insert("roadmaps", {
      userId: args.userId,
      title: args.topic,
      topic: args.topic,
      status: "questioning" as const,
      questions: [],
      answers: [],
      nodes: [],
      edges: [],
    });
    return roadmapId;
  },
});

/**
 * Get a roadmap by ID
 */
export const get = query({
  args: {
    id: v.id("roadmaps"),
  },
  returns: v.union(
    v.object({
      _id: v.id("roadmaps"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      topic: v.string(),
      status: v.union(
        v.literal("questioning"),
        v.literal("generating"),
        v.literal("ready")
      ),
      questions: v.array(questionValidator),
      answers: v.array(answerValidator),
      nodes: v.array(nodeValidator),
      edges: v.array(edgeValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.id);
    return roadmap;
  },
});

/**
 * List all roadmaps for a user
 */
export const list = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("roadmaps"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      topic: v.string(),
      status: v.union(
        v.literal("questioning"),
        v.literal("generating"),
        v.literal("ready")
      ),
      questions: v.array(questionValidator),
      answers: v.array(answerValidator),
      nodes: v.array(nodeValidator),
      edges: v.array(edgeValidator),
    })
  ),
  handler: async (ctx, args) => {
    const roadmaps = await ctx.db
      .query("roadmaps")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return roadmaps;
  },
});

/**
 * Save AI-generated questions
 */
export const saveQuestions = mutation({
  args: {
    id: v.id("roadmaps"),
    questions: v.array(questionValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      questions: args.questions,
    });
    return null;
  },
});

/**
 * Save user's answers and update status to generating
 */
export const saveAnswers = mutation({
  args: {
    id: v.id("roadmaps"),
    answers: v.array(answerValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      answers: args.answers,
      status: "generating" as const,
    });
    return null;
  },
});

/**
 * Save generated roadmap nodes and edges
 */
export const saveRoadmap = mutation({
  args: {
    id: v.id("roadmaps"),
    title: v.string(),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      nodes: args.nodes,
      edges: args.edges,
      status: "ready" as const,
    });
    return null;
  },
});

/**
 * Update an individual node's data
 */
export const updateNode = mutation({
  args: {
    id: v.id("roadmaps"),
    nodeId: v.string(),
    data: v.object({
      label: v.optional(v.string()),
      description: v.optional(v.string()),
      resources: v.optional(v.array(resourceValidator)),
      completed: v.optional(v.boolean()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.id);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const updatedNodes = roadmap.nodes.map((node) => {
      if (node.id === args.nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...(args.data.label !== undefined && { label: args.data.label }),
            ...(args.data.description !== undefined && {
              description: args.data.description,
            }),
            ...(args.data.resources !== undefined && {
              resources: args.data.resources,
            }),
            ...(args.data.completed !== undefined && {
              completed: args.data.completed,
            }),
          },
        };
      }
      return node;
    });

    await ctx.db.patch(args.id, { nodes: updatedNodes });
    return null;
  },
});

/**
 * Update the layout (positions) of nodes after drag
 */
export const updateLayout = mutation({
  args: {
    id: v.id("roadmaps"),
    nodes: v.array(nodeValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      nodes: args.nodes,
    });
    return null;
  },
});

/**
 * Delete a roadmap
 */
export const deleteRoadmap = mutation({
  args: {
    id: v.id("roadmaps"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

