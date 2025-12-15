"use client";

import { useEffect, useState } from "react";
import { llmAPI, type LLMStatus } from "@/lib/api";

interface RequestState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const statusColors = {
  ok: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-rose-400",
};

export default function LLMStatusCard() {
  const [status, setStatus] = useState<LLMStatus | null>(null);
  const [requestState, setRequestState] = useState<RequestState>({
    loading: false,
    error: null,
    successMessage: null,
  });

  const loadStatus = async () => {
    try {
      setRequestState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await llmAPI.getStatus();
      setStatus(data);
      setRequestState((prev) => ({ ...prev, loading: false }));
    } catch (err: any) {
      setRequestState({
        loading: false,
        error: err?.message || "Failed to load LLM status",
        successMessage: null,
      });
    }
  };

  const handleInitialize = async () => {
    try {
      setRequestState({ loading: true, error: null, successMessage: null });
      const response = await llmAPI.initialize();
      setRequestState({
        loading: false,
        error: null,
        successMessage: response.message || "LLM initialized successfully",
      });
      await loadStatus();
    } catch (err: any) {
      setRequestState({
        loading: false,
        error: err?.message || "Failed to initialize LLM",
        successMessage: null,
      });
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const renderStatusBadge = (label: string, value: boolean | string, type: "ok" | "warn" | "error") => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${statusColors[type]}`}>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </span>
    </div>
  );

  return (
    <section className="glass p-4 rounded-2xl border border-white/10 text-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            LLM STATUS
          </p>
          <h2 className="text-lg font-semibold">Groq Integration</h2>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {status ? (
        <div className="space-y-2">
          {renderStatusBadge(
            "API Key Configured",
            status.api_key_configured,
            status.api_key_configured ? "ok" : "error"
          )}
          {renderStatusBadge(
            "LLM Initialized",
            status.llm_initialized,
            status.llm_initialized ? "ok" : "warn"
          )}
          {renderStatusBadge("Model", status.model_name, "ok")}
          {renderStatusBadge(
            "Temperature",
            status.temperature.toString(),
            "ok"
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Fetching LLM status...</p>
      )}

      <div className="space-y-2">
        <button
          onClick={handleInitialize}
          disabled={requestState.loading}
          className="w-full rounded-xl bg-white/10 hover:bg-white/20 transition-all py-2 text-sm font-medium"
        >
          {requestState.loading ? "Initializing..." : "Initialize / Refresh"}
        </button>
        <button
          onClick={loadStatus}
          disabled={requestState.loading}
          className="w-full rounded-xl border border-white/10 hover:border-white/30 transition-all py-2 text-sm"
        >
          Refresh Status
        </button>
      </div>

      {requestState.error && (
        <p className="text-sm text-rose-300">{requestState.error}</p>
      )}
      {requestState.successMessage && (
        <p className="text-sm text-emerald-300">{requestState.successMessage}</p>
      )}
    </section>
  );
}
