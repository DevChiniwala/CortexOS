import { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Top Header */}
      <header className="h-14 border-b border-[var(--color-line)] flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4 text-sm text-[var(--color-ink-2)]">
          <span>Ask Cortex anything - research, signals, agents...</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
            <span className="text-[var(--color-ink-2)]">ALL SYSTEMS • 99.97%</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-primary)] transition-colors">
            <span className="font-medium">+ New Research</span>
          </button>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 scroll-stable">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
