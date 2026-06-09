import * as React from "react"
import { useStreamPanelStore } from "@/lib/store/stream-panel-store"
import { StreamTerminal } from "./stream-terminal"
import { IconX, IconMaximize, IconMinimize } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function StreamPanelLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, isExpanded, activeTabId, tabs, closePanel, toggleExpanded, setActiveTab, removeTab } = useStreamPanelStore()
  const [panelWidth, setPanelWidth] = React.useState(400)
  const isResizing = React.useRef(false)

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      // Calculate new width based on mouse position from right edge
      const newWidth = window.innerWidth - e.clientX
      // Constrain width
      if (newWidth > 300 && newWidth < window.innerWidth - 300) {
        setPanelWidth(newWidth)
      }
    }
    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = "default"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  if (!isOpen) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {!isExpanded && (
        <>
          <div className="flex-1 overflow-hidden min-w-0">
            {children}
          </div>
          
          {/* Resize Handle */}
          <div 
            className="w-1.5 bg-line hover:bg-primary/50 transition-colors cursor-col-resize active:bg-primary shrink-0 z-10"
            onMouseDown={(e) => {
              e.preventDefault()
              isResizing.current = true
              document.body.style.cursor = "col-resize"
            }}
          />
        </>
      )}
      
      <div 
        style={{ width: isExpanded ? '100%' : `${panelWidth}px` }}
        className={cn(
          "flex flex-col h-full bg-bg border-l border-line shadow-2xl shrink-0 transition-[width] duration-0",
          isExpanded && "w-full border-l-0"
        )}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-line overflow-x-auto bg-surface/30 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                activeTabId === tab.id 
                  ? "bg-surface text-ink shadow-sm border border-line" 
                  : "text-ink-3 hover:text-ink-2 hover:bg-surface/50 border border-transparent"
              )}
            >
              {tab.title}
              <div 
                className="p-0.5 rounded-sm hover:bg-line text-ink-3 hover:text-ink transition-colors ml-1"
                onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
              >
                <IconX className="w-3 h-3" />
              </div>
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-1">
            <button onClick={toggleExpanded} className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface transition-colors">
              {isExpanded ? <IconMinimize className="w-4 h-4" /> : <IconMaximize className="w-4 h-4" />}
            </button>
            <button onClick={closePanel} className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-surface transition-colors">
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Terminal */}
        <div className="flex-1 p-4 bg-bg overflow-hidden">
          {activeTabId ? (
            <StreamTerminal jobId={activeTabId} isActive={true} />
          ) : (
            <div className="h-full flex items-center justify-center text-ink-3 text-sm">
              Select a stream tab to view logs
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
