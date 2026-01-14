"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { RoadmapEditor } from "@/components/roadmap/RoadmapEditor";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";
import type { Node } from "@xyflow/react";
import type { RoadmapNodeData } from "@/components/roadmap/RoadmapNode";

export default function RoadmapPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const params = useParams();
  const roadmapId = params.id as Id<"roadmaps">;

  const roadmap = useQuery(api.roadmaps.get, { id: roadmapId });
  const updateNode = useMutation(api.roadmaps.updateNode);
  const updateLayout = useMutation(api.roadmaps.updateLayout);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleNodeUpdate = useCallback(
    async (nodeId: string, data: Partial<RoadmapNodeData>) => {
      await updateNode({ id: roadmapId, nodeId, data });
    },
    [roadmapId, updateNode]
  );

  const handleLayoutChange = useCallback(
    async (nodes: Node[]) => {
      await updateLayout({
        id: roadmapId,
        nodes: nodes.map((n) => ({
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

  if (authLoading || roadmap === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roadmap === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Roadmap not found</h1>
        <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Convert stored nodes/edges to React Flow format
  const nodes: Node[] = roadmap.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }));

  const edges = roadmap.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep" as const,
  }));

  const completedCount = roadmap.nodes.filter((n) => n.data.completed).length;
  const progress = roadmap.nodes.length > 0
    ? Math.round((completedCount / roadmap.nodes.length) * 100)
    : 0;

  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      <header className="shrink-0 bg-zinc-950 border-b border-zinc-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)' }}>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
            </Link>
            <div className="h-6 w-px bg-zinc-700" />
            <div>
              <h1 className="font-bold text-lg text-zinc-100">{roadmap.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  {progress}% Complete
                </Badge>
                <span className="text-xs text-zinc-500">
                  {completedCount} of {roadmap.nodes.length} steps done
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-zinc-200 transition-colors text-sm px-4 py-2 rounded-lg hover:bg-zinc-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {roadmap.nodes.length > 0 ? (
          <RoadmapEditor
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleLayoutChange}
            onNodeUpdate={handleNodeUpdate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-zinc-400">This roadmap is still being generated...</p>
          </div>
        )}
      </main>
    </div>
  );
}

