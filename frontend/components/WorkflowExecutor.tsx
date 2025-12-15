"use client";

import { useState, useEffect } from "react";
import { workflowAPI } from "@/lib/api";

interface WorkflowExecutorProps {
  workflowId: string | null;
}

export function WorkflowExecutor({ workflowId }: WorkflowExecutorProps) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [input, setInput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (workflowId) {
      setSelectedId(workflowId);
    }
  }, [workflowId]);

  const loadWorkflows = async () => {
    try {
      const data = await workflowAPI.list();
      setWorkflows(data);
    } catch (err) {
      console.error("Failed to load workflows:", err);
    }
  };

  const handleExecute = async () => {
    if (!selectedId || !input.trim()) {
      alert("Please select a workflow and provide input");
      return;
    }

    try {
      setExecuting(true);
      setResult(null);
      const data = await workflowAPI.execute(selectedId, input);
      setResult(data);
    } catch (err: any) {
      setResult({
        error: err.response?.data?.error || err.message || "Execution failed",
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Execute Workflow</h2>

      <div className="glass rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2 font-medium">
            Select Workflow
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-3 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all"
          >
            <option value="">Choose a workflow...</option>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2 font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all placeholder:text-gray-600"
            rows={5}
            placeholder="Enter your workflow input..."
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={executing || !selectedId || !input.trim()}
          className="px-8 py-3 glass-strong rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          {executing ? "Executing..." : "Execute"}
        </button>
      </div>

      {result && (
        <div className="glass rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-white mb-4">Results</h3>

          {result.error ? (
            <div className="glass border-red-500/30 rounded-lg p-4 text-red-300">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">
                  Final Output
                </h4>
                <div className="glass-subtle rounded-lg p-4 text-white whitespace-pre-wrap">
                  {result.final_state?.last_response_content || "No output"}
                </div>
              </div>

              {result.execution_log && result.execution_log.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">
                    Execution Log
                  </h4>
                  <div className="glass-subtle rounded-lg p-4 space-y-1">
                    {result.execution_log.map((log: string, idx: number) => (
                      <div key={idx} className="text-sm text-gray-400">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.summary && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">
                    Summary
                  </h4>
                  <div className="glass-subtle rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Nodes Executed:</span>
                        <span className="ml-2 text-white">
                          {result.summary.nodes_executed}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 text-white">
                          {result.summary.has_error ? "Failed" : "Success"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkflowExecutor;