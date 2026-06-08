import * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { MainShell } from "./components/layout/main-shell"
import { CommandPalette } from "./components/command-palette"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { setupEventBridge } from "./lib/ipc/event-bridge"

// Pages
import Dashboard from "./pages/dashboard"
import Companies from "./pages/companies"
import Contacts from "./pages/contacts"
import Agents from "./pages/agents"
import MemoryGraph from "./pages/memory"
import Signals from "./pages/signals"
import Flow from "./pages/flow"

const queryClient = new QueryClient()

export default function App() {
  React.useEffect(() => {
    // Setup Tauri IPC event listeners
    const unlisten = setupEventBridge(queryClient)
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<MainShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="signals" element={<Signals />} />
          <Route path="agents" element={<Agents />} />
          <Route path="memory" element={<MemoryGraph />} />
          <Route path="flow" element={<Flow />} />
          <Route path="settings" element={<div className="p-8 text-ink">Settings (Coming soon)</div>} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}
