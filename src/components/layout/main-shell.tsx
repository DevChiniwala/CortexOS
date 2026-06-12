import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { IconSearch } from "@tabler/icons-react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { StreamPanelLayout } from "../stream/stream-panel-layout";

export function MainShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-ink selection:bg-primary/30">
      <OnboardingWizard />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-line bg-surface/50 backdrop-blur-sm flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-ink-3">
            <IconSearch className="w-4 h-4" />
            <span>Press Cmd+K to search CortexOS</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="text-ink-2 font-mono text-xs">SYS_ONLINE</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors">
              <span className="font-medium">+ New Task</span>
            </button>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden bg-bg relative">
          <StreamPanelLayout>
            <div className="h-full overflow-y-auto p-6 scroll-stable">
              <div className="max-w-[1400px] mx-auto w-full h-full">
                <Outlet />
              </div>
            </div>
          </StreamPanelLayout>
        </div>
      </main>
    </div>
  );
}
