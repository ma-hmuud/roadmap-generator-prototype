"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { TopicInput } from "./TopicInput";
import { QuestionsForm } from "./QuestionsForm";
import { RoadmapEditor } from "./RoadmapEditor";
import { questionsSchema, roadmapSchema } from "@/lib/schemas";
import { getLayoutedElements } from "@/lib/layout";
import type { Id } from "@/convex/_generated/dataModel";
import type { Node, Edge } from "@xyflow/react";

type Step = "topic" | "questions" | "generating" | "editor";

interface RoadmapCreatorProps {
  userId: Id<"users">;
}

export function RoadmapCreator({ userId }: RoadmapCreatorProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [roadmapId, setRoadmapId] = useState<Id<"roadmaps"> | null>(null);
  const [questions, setQuestions] = useState<{ id: string; question: string }[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const createRoadmap = useMutation(api.roadmaps.create);
  const saveQuestions = useMutation(api.roadmaps.saveQuestions);
  const saveAnswers = useMutation(api.roadmaps.saveAnswers);
  const saveRoadmapData = useMutation(api.roadmaps.saveRoadmap);
  const updateNode = useMutation(api.roadmaps.updateNode);
  const updateLayout = useMutation(api.roadmaps.updateLayout);

  // AI hooks for streaming
  const {
    object: questionsObject,
    submit: submitQuestions,
    isLoading: isLoadingQuestions,
  } = useObject({
    api: "/api/generate-questions",
    schema: questionsSchema,
  });

  const {
    object: roadmapObject,
    submit: submitRoadmap,
    isLoading: isLoadingRoadmap,
  } = useObject({
    api: "/api/generate-roadmap",
    schema: roadmapSchema,
  });

  // Handle questions streaming completion
  useEffect(() => {
    if (questionsObject?.questions && questionsObject.questions.length > 0 && !isLoadingQuestions) {
      const validQuestions = questionsObject.questions.filter(
        (q: { id?: string; question?: string } | undefined): q is { id: string; question: string } => 
          q !== undefined && q.id !== undefined && q.question !== undefined
      );
      if (validQuestions.length > 0) {
        setQuestions(validQuestions);
        if (roadmapId) {
          saveQuestions({ id: roadmapId, questions: validQuestions });
        }
        setStep("questions");
      }
    }
  }, [questionsObject, isLoadingQuestions, roadmapId, saveQuestions]);

  // Handle roadmap streaming completion
  useEffect(() => {
    if (roadmapObject?.nodes && roadmapObject?.edges && !isLoadingRoadmap) {
      type PartialNode = { id?: string; label?: string; description?: string; resources?: { title?: string; url?: string }[] } | undefined;
      type PartialEdge = { source?: string; target?: string } | undefined;
      
      const validNodes = roadmapObject.nodes.filter(
        (n: PartialNode): n is { id: string; label: string; description: string; resources: { title: string; url: string }[] } =>
          n !== undefined && n.id !== undefined && n.label !== undefined && n.description !== undefined && n.resources !== undefined
      );
      const validEdges = roadmapObject.edges.filter(
        (e: PartialEdge): e is { source: string; target: string } =>
          e !== undefined && e.source !== undefined && e.target !== undefined
      );
      
      if (validNodes.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          validNodes,
          validEdges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        if (roadmapId && roadmapObject.title) {
          saveRoadmapData({
            id: roadmapId,
            title: roadmapObject.title,
            nodes: layoutedNodes.map((n) => ({
              id: n.id,
              type: n.type || "roadmapNode",
              position: n.position,
              data: n.data as {
                label: string;
                description: string;
                resources: { title: string; url: string }[];
                completed: boolean;
              },
            })),
            edges: layoutedEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          });
        }
        setStep("editor");
      }
    }
  }, [roadmapObject, isLoadingRoadmap, roadmapId, saveRoadmapData]);

  const handleTopicSubmit = useCallback(
    async (submittedTopic: string) => {
      setTopic(submittedTopic);
      
      // Create roadmap in database
      const id = await createRoadmap({ userId, topic: submittedTopic });
      setRoadmapId(id);

      // Generate questions
      submitQuestions({ topic: submittedTopic });
    },
    [userId, createRoadmap, submitQuestions]
  );

  const handleQuestionsSubmit = useCallback(
    async (answers: { questionId: string; question: string; answer: string }[]) => {
      if (!roadmapId) return;

      // Save answers
      await saveAnswers({
        id: roadmapId,
        answers: answers.map((a) => ({ questionId: a.questionId, answer: a.answer })),
      });

      setStep("generating");

      // Generate roadmap
      submitRoadmap({
        topic,
        answers: answers.map((a) => ({ question: a.question, answer: a.answer })),
      });
    },
    [roadmapId, topic, saveAnswers, submitRoadmap]
  );

  const handleNodeUpdate = useCallback(
    async (nodeId: string, data: Partial<{ label: string; description: string; resources: { title: string; url: string }[]; completed: boolean }>) => {
      if (!roadmapId) return;
      await updateNode({ id: roadmapId, nodeId, data });
    },
    [roadmapId, updateNode]
  );

  const handleLayoutChange = useCallback(
    async (updatedNodes: Node[]) => {
      if (!roadmapId) return;
      await updateLayout({
        id: roadmapId,
        nodes: updatedNodes.map((n) => ({
          id: n.id,
          type: n.type || "roadmapNode",
          position: n.position,
          data: n.data as {
            label: string;
            description: string;
            resources: { title: string; url: string }[];
            completed: boolean;
          },
        })),
      });
    },
    [roadmapId, updateLayout]
  );

  return (
    <div className="min-h-screen">
      {step === "topic" && (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoadingQuestions} />
        </div>
      )}

      {step === "questions" && questions.length > 0 && (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <QuestionsForm
            topic={topic}
            questions={questions}
            onSubmit={handleQuestionsSubmit}
            isLoading={isLoadingRoadmap}
          />
        </div>
      )}

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 animate-pulse">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            Generating Your Roadmap
          </h2>
          <p className="text-zinc-400 text-center max-w-md">
            AI is creating a personalized learning path based on your answers...
          </p>
          
          {/* Show partial roadmap while generating */}
          {roadmapObject?.title && (
            <p className="text-emerald-400 mt-4 font-medium">
              {roadmapObject.title}
            </p>
          )}
          {roadmapObject?.nodes && (
            <p className="text-zinc-500 text-sm mt-2">
              {roadmapObject.nodes.filter((n: { label?: string } | undefined) => n?.label).length} steps generated...
            </p>
          )}
        </div>
      )}

      {step === "editor" && nodes.length > 0 && (
        <div className="h-screen flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">
                {roadmapObject?.title || topic}
              </h1>
              <p className="text-sm text-zinc-400">
                Click on any step to view details and edit
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <div className="flex-1">
            <RoadmapEditor
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={handleLayoutChange}
              onNodeUpdate={handleNodeUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

