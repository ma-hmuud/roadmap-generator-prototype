"use client";

import { RoadmapList } from "@/components/roadmap";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const currentUser = useQuery(api.myFunctions.currentUser);
  const roadmaps = useQuery(
    api.roadmaps.list,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const deleteRoadmap = useMutation(api.roadmaps.deleteRoadmap);

  const handleDelete = async (id: Id<"roadmaps">) => {
    if (confirm("Are you sure you want to delete this roadmap?")) {
      await deleteRoadmap({ id });
    }
  };

  if (currentUser === undefined || (currentUser && roadmaps === undefined)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="flex items-center gap-2" href="/">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="text-zinc-100 font-semibold">Roadmap</span>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-300 text-sm"
            onClick={() => void signOut().then(() => router.push("/signin"))}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Your Roadmaps</h1>
          <Link href="/roadmap/new">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm"
              style={{ background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </Link>
        </div>

        <RoadmapList roadmaps={roadmaps ?? []} onDelete={handleDelete} />
      </main>
    </div>
  );
}