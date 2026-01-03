"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RoadmapList } from "@/components/roadmap/RoadmapList";
import type { Id } from "@/convex/_generated/dataModel";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
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
            <h1 className="font-bold text-xl text-zinc-100">Roadmap Generator</h1>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Content />
      </main>
    </div>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  
  if (!isAuthenticated) return null;

  return (
    <Button
      variant="ghost"
      className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
      onClick={() =>
        void signOut().then(() => {
          router.push("/signin");
        })
      }
    >
      Sign out
    </Button>
  );
}

function Content() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-8">
          <svg
            className="w-10 h-10 text-white"
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
        <h2 className="text-4xl font-bold text-zinc-100 mb-4">
          AI-Powered Learning Roadmaps
        </h2>
        <p className="text-zinc-400 text-lg max-w-lg mb-8">
          Generate personalized learning paths for any topic. Answer a few questions, 
          and AI will create a step-by-step roadmap tailored to your experience and goals.
        </p>
        <Link href="/signin">
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  return <AuthenticatedContent />;
}

function AuthenticatedContent() {
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100">Your Roadmaps</h2>
          <p className="text-zinc-400 mt-1">
            View, edit, and track progress on your learning journeys
          </p>
        </div>
        <Link href="/roadmap/new">
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Roadmap
          </Button>
        </Link>
      </div>

      <RoadmapList roadmaps={roadmaps ?? []} onDelete={handleDelete} />
    </div>
  );
}
