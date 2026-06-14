import { useState, useEffect, useCallback, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@/lib/ipc/commands";
import { isTauriRuntime } from "@/lib/ipc/commands";
import type { LogEntry } from "@/lib/types";

export interface StreamState {
  isStreaming: boolean;
  logs: LogEntry[];
  jobId: string | null;
  error: string | null;
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    logs: [],
    jobId: null,
    error: null,
  });

  const unlistenRef = useRef<UnlistenFn | null>(null);
  // Keep track of logs internally to avoid dependency cycle in simulated stream
  const logsRef = useRef<LogEntry[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unlistenRef.current) {
        unlistenRef.current();
      }
    };
  }, []);

  const clearStream = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [], error: null }));
    logsRef.current = [];
  }, []);

  // Browser Mock Stream
  const startSimulatedStream = useCallback(async (jobType: string, targetName: string) => {
    setState({ isStreaming: true, logs: [], jobId: "sim-" + Date.now(), error: null });
    logsRef.current = [];

    const addLog = (type: LogEntry["type"], content: string) => {
      const entry: LogEntry = { type, content, timestamp: Date.now() };
      logsRef.current = [...logsRef.current, entry];
      setState((prev) => ({ ...prev, logs: logsRef.current }));
    };

    addLog("system", `[SIMULATED] Starting ${jobType} agent for ${targetName}...`);
    
    // Simulate some work
    await new Promise((r) => setTimeout(r, 1000));
    addLog("thinking", "Analyzing target profile and preparing research strategy...");
    
    await new Promise((r) => setTimeout(r, 1500));
    addLog("tool_use", "Calling search_web tool with query: 'recent news about " + targetName + "'");
    
    await new Promise((r) => setTimeout(r, 2000));
    addLog("tool_result", "Found 15 results. Extracting relevant context...");
    
    await new Promise((r) => setTimeout(r, 1000));
    addLog("assistant", "I have synthesized the recent news. " + targetName + " recently announced a new product line.");
    
    await new Promise((r) => setTimeout(r, 1000));
    addLog("system", `[SIMULATED] ${jobType} agent completed successfully.`);
    
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const startStream = useCallback(async (jobType: string, targetId: number, targetName: string) => {
    if (!isTauriRuntime()) {
      return startSimulatedStream(jobType, targetName);
    }

    try {
      clearStream();
      setState((prev) => ({ ...prev, isStreaming: true, error: null }));
      
      // Start listening to Tauri events for this specific job stream (or global stream)
      if (unlistenRef.current) unlistenRef.current();
      
      unlistenRef.current = await listen<LogEntry>("stream_event", (event) => {
        logsRef.current = [...logsRef.current, event.payload];
        setState((prev) => ({ ...prev, logs: logsRef.current }));
      });

      // Trigger the actual backend job
      // In a real implementation, this invoke would return the jobId
      const response = await invoke<any>("start_research_job", { jobType, targetId });
      setState((prev) => ({ ...prev, jobId: response.jobId || "native-job" }));

    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        isStreaming: false, 
        error: err instanceof Error ? err.message : "Failed to start stream" 
      }));
    }
  }, [clearStream, startSimulatedStream]);

  const stopStream = useCallback(async () => {
    if (state.jobId && isTauriRuntime() && !state.jobId.startsWith("sim-")) {
       try {
         await invoke("cancel_job", { jobId: state.jobId });
       } catch (e) {
         console.error("Failed to cancel job", e);
       }
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
  }, [state.jobId]);

  return {
    ...state,
    startStream,
    stopStream,
    clearStream,
  };
}
