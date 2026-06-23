import * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { MainShell } from "./components/layout/main-shell"
import { CommandPalette } from "./components/command-palette"
import { QueryClientProvider } from "@tanstack/react-query"
import { setupEventBridge } from "./lib/ipc/event-bridge"
import { createQueryClient, warmCache } from "./lib/sync"

// Pages
import Dashboard from "./pages/dashboard"
import Companies from "./pages/companies"
import CompanyDetail from "./pages/company-detail"
import Contacts from "./pages/contacts"
import ContactDetail from "./pages/contact-detail"
import Agents from "./pages/agents"
import MemoryGraph from "./pages/memory"
import Signals from "./pages/signals"
import Flow from "./pages/flow"
import Settings from "./pages/settings"
import Outreach from "./pages/outreach"
import ICP from "./pages/icp"

const queryClient = createQueryClient()

export default function App() {
  React.useEffect(() => {
    // Setup Tauri IPC event listeners
    const unlisten = setupEventBridge(queryClient)

    // Pre-fetch critical data for instant UI
    warmCache(queryClient)

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
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="signals" element={<Signals />} />
          <Route path="agents" element={<Agents />} />
          <Route path="icp" element={<ICP />} />
          <Route path="memory" element={<MemoryGraph />} />
          <Route path="flow" element={<Flow />} />
          <Route path="outreach" element={<Outreach />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}
