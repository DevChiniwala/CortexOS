import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/sidebar";
import { MainShell } from "./components/layout/main-shell";

function DashboardPlaceholder() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-2">Cortex Dashboard</h1>
        <p className="text-[var(--color-ink-2)]">Realtime situational awareness across agents, signals, memory and verification.</p>
      </div>
      
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="panel p-5">
          <div className="text-xs font-mono text-[var(--color-ink-3)] mb-2 uppercase">Active Agents</div>
          <div className="text-3xl font-display text-[var(--color-primary)]">5/6</div>
          <div className="text-xs text-[var(--color-ink-3)] mt-1">Cluster healthy</div>
        </div>
        <div className="panel p-5">
          <div className="text-xs font-mono text-[var(--color-ink-3)] mb-2 uppercase">Signals · 24H</div>
          <div className="text-3xl font-display">247</div>
          <div className="text-xs text-[var(--color-success)] mt-1">↑ 18% vs yesterday</div>
        </div>
        <div className="panel p-5">
          <div className="text-xs font-mono text-[var(--color-ink-3)] mb-2 uppercase">Memory Nodes</div>
          <div className="text-3xl font-display">18,432</div>
          <div className="text-xs text-[var(--color-ink-3)] mt-1">Graph live</div>
        </div>
        <div className="panel p-5">
          <div className="text-xs font-mono text-[var(--color-ink-3)] mb-2 uppercase">Verified</div>
          <div className="text-3xl font-display">1842</div>
          <div className="text-xs text-[var(--color-ink-3)] mt-1">Rejected · 318</div>
        </div>
        <div className="panel p-5">
          <div className="text-xs font-mono text-[var(--color-ink-3)] mb-2 uppercase">Uptime</div>
          <div className="text-3xl font-display">99.97%</div>
          <div className="text-xs text-[var(--color-ink-3)] mt-1">us-east-1</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-ink)] selection:bg-[var(--color-primary)] selection:text-white">
        <Sidebar />
        <MainShell>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
            <Route path="/agents" element={<div className="p-8">Agents Config</div>} />
            <Route path="/memory" element={<div className="p-8">Memory Graph</div>} />
            <Route path="/signals" element={<div className="p-8">Live Signals</div>} />
            <Route path="/flow" element={<div className="p-8">Flow Workflows</div>} />
            <Route path="/labs" element={<div className="p-8">Labs</div>} />
            <Route path="/intelligence" element={<div className="p-8">Intelligence</div>} />
            <Route path="/stream" element={<div className="p-8">Stream Logs</div>} />
            <Route path="/verify" element={<div className="p-8">Verification Engine</div>} />
          </Routes>
        </MainShell>
      </div>
    </BrowserRouter>
  );
}
