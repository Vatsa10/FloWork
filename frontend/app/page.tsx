"use client";

import { useState, useEffect } from "react";
import WorkflowList from "@/components/WorkflowList";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import WorkflowExecutor from "@/components/WorkflowExecutor";
import LLMStatusCard from "@/components/LLMStatus";

export function HomePage() {
  const [view, setView] = useState<"list" | "builder" | "executor">("list");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black">

      <nav className="glass-strong sticky top-0 z-50 shadow-lg shadow-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Flowork
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setView("list");
                  setSelectedWorkflowId(null);
                }}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  view === "list"
                    ? "glass-strong text-white shadow-lg shadow-white/10"
                    : "glass text-gray-300 hover:glass-strong"
                }`}
              >
                Workflows
              </button>
              <button
                onClick={() => {
                  setView("builder");
                  setSelectedWorkflowId(null);
                }}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  view === "builder"
                    ? "glass-strong text-white shadow-lg shadow-white/10"
                    : "glass text-gray-300 hover:glass-strong"
                }`}
              >
                Build
              </button>
              <button
                onClick={() => setView("executor")}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  view === "executor"
                    ? "glass-strong text-white shadow-lg shadow-white/10"
                    : "glass text-gray-300 hover:glass-strong"
                }`}
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <LLMStatusCard />
        {view === "list" && (
          <WorkflowList
            onEdit={(id) => {
              setSelectedWorkflowId(id);
              setView("builder");
            }}
            onExecute={(id) => {
              setSelectedWorkflowId(id);
              setView("executor");
            }}
          />
        )}
        {view === "builder" && (
          <WorkflowBuilder
            workflowId={selectedWorkflowId}
            onSaved={() => setView("list")}
          />
        )}
        {view === "executor" && (
          <WorkflowExecutor workflowId={selectedWorkflowId} />
        )}
      </main>
    </div>
  );
}

export default HomePage;