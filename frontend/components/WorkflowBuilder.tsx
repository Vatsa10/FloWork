"use client";

import { useState, useEffect } from "react";
import { workflowAPI, Node, Workflow } from "@/lib/api";

interface WorkflowBuilderProps {
  workflowId: string | null;
  onSaved: () => void;
}

export function WorkflowBuilder({ workflowId, onSaved }: WorkflowBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    } else {
      setName("");
      setDescription("");
      setNodes([]);
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      const workflow = await workflowAPI.get(workflowId);
      setName(workflow.name);
      setDescription(workflow.description || "");
      setNodes(workflow.nodes);
    } catch (err: any) {
      alert(err.message || "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  };

  const addNode = () => {
    const newNode: Node = {
      name: `Node ${nodes.length + 1}`,
      prompt: "",
      routing_rules: {
        default_target: "END",
        conditional_targets: [],
      },
    };
    setNodes([...nodes, newNode]);
  };

  const updateNode = (index: number, field: keyof Node, value: any) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    setNodes(updated);
  };

  const removeNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Workflow name is required");
      return;
    }

    try {
      setLoading(true);
      const workflow: Workflow = {
        name,
        description,
        nodes,
      };

      if (workflowId) {
        await workflowAPI.update(workflowId, workflow);
      } else {
        await workflowAPI.create(workflow);
      }

      onSaved();
    } catch (err: any) {
      alert(err.message || "Failed to save workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">
        {workflowId ? "Edit Workflow" : "Create Workflow"}
      </h2>

      <div className="glass rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2 font-medium">Workflow Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all placeholder:text-gray-600"
            placeholder="My Workflow"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all placeholder:text-gray-600"
            rows={3}
            placeholder="Describe your workflow..."
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-white">Nodes</h3>
          <button
            onClick={addNode}
            className="px-5 py-2 glass-strong rounded-lg hover:shadow-lg hover:shadow-white/10 transition-all font-medium text-white"
          >
            Add Node
          </button>
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-12 glass rounded-lg">
            <p className="text-gray-400 mb-4">No nodes yet</p>
            <button
              onClick={addNode}
              className="px-6 py-3 glass-strong rounded-lg hover:shadow-lg hover:shadow-white/10 transition-all text-white"
            >
              Add First Node
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {nodes.map((node, index) => (
              <div
                key={index}
                className="glass rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    Node {index + 1}
                  </h4>
                  <button
                    onClick={() => removeNode(index)}
                    className="px-3 py-1 glass text-gray-400 rounded text-sm hover:text-red-400 hover:border-red-400/30 transition-all"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">Node Name</label>
                    <input
                      type="text"
                      value={node.name}
                      onChange={(e) => updateNode(index, "name", e.target.value)}
                      className="w-full px-4 py-2 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">Prompt</label>
                    <textarea
                      value={node.prompt}
                      onChange={(e) => updateNode(index, "prompt", e.target.value)}
                      className="w-full px-4 py-2 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all placeholder:text-gray-600"
                      rows={4}
                      placeholder="Enter the prompt for this node..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">
                      Default Target
                    </label>
                    <input
                      type="text"
                      value={node.routing_rules.default_target}
                      onChange={(e) =>
                        updateNode(index, "routing_rules", {
                          ...node.routing_rules,
                          default_target: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 glass-subtle rounded-lg text-white focus:glass-strong focus:outline-none transition-all placeholder:text-gray-600"
                      placeholder="END or node ID"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 glass-strong rounded-lg font-semibold hover:shadow-xl hover:shadow-white/20 transition-all disabled:opacity-50 text-white"
        >
          {loading ? "Saving..." : "Save Workflow"}
        </button>
        <button
          onClick={onSaved}
          className="px-8 py-3 glass rounded-lg font-semibold hover:glass-strong transition-all text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default WorkflowBuilder;