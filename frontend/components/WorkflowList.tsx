"use client";

import { useState, useEffect } from "react";
import { workflowAPI } from "@/lib/api";

interface WorkflowMetadata {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  node_count: number;
}

interface WorkflowListProps {
  onEdit: (id: string) => void;
  onExecute: (id: string) => void;
}

export function WorkflowList({ onEdit, onExecute }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowAPI.list();
      setWorkflows(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await workflowAPI.delete(id);
      await loadWorkflows();
    } catch (err: any) {
      alert(err.message || "Failed to delete workflow");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass border-red-500/30 rounded-lg p-6 text-red-300">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Your Workflows</h2>
        <button
          onClick={() => onEdit("")}
          className="px-6 py-3 glass-strong rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 transition-all text-white"
        >
          Create New
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-16 glass rounded-lg">
          <p className="text-gray-400 text-lg mb-4">No workflows yet</p>
          <button
            onClick={() => onEdit("")}
            className="px-6 py-3 glass-strong rounded-lg hover:shadow-lg hover:shadow-white/10 transition-all text-white"
          >
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="glass rounded-lg p-6 hover:glass-strong transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p className="text-gray-400 mb-3">{workflow.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{workflow.node_count} nodes</span>
                    <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onExecute(workflow.id)}
                    className="px-4 py-2 glass-strong text-white rounded-lg hover:shadow-lg hover:shadow-white/10 transition-all"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => onEdit(workflow.id)}
                    className="px-4 py-2 glass text-gray-300 rounded-lg hover:glass-strong hover:text-white transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="px-4 py-2 glass text-gray-400 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkflowList;