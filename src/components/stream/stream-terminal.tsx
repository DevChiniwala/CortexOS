import * as React from "react";
import { LogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconTerminal2, IconLoader2, IconCheck, IconX, IconBrain, IconTool } from "@tabler/icons-react";

interface StreamTerminalProps {
  logs: LogEntry[];
  isStreaming: boolean;
  className?: string;
  title?: string;
  onKill?: () => void;
}

export function StreamTerminal({ logs, isStreaming, className, title = "Agent Output", onKill }: StreamTerminalProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case "system": return <IconTerminal2 className="w-4 h-4 text-primary" />;
      case "thinking": return <IconBrain className="w-4 h-4 text-warning" />;
      case "tool_use": return <IconTool className="w-4 h-4 text-info" />;
      case "tool_result": return <IconCheck className="w-4 h-4 text-success" />;
      case "error": return <IconX className="w-4 h-4 text-danger" />;
      default: return <IconTerminal2 className="w-4 h-4 text-ink-3" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "system": return "text-primary";
      case "thinking": return "text-warning";
      case "tool_use": return "text-info";
      case "tool_result": return "text-success";
      case "error": return "text-danger";
      case "assistant": return "text-ink";
      default: return "text-ink-2";
    }
  };

  return (
    <div className={cn("flex flex-col rounded-xl border border-line bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface-hover/50">
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <IconLoader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <IconTerminal2 className="w-4 h-4 text-ink-3" />
          )}
          <span className="text-sm font-medium text-ink font-mono">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Running
            </span>
          )}
          {isStreaming && onKill && (
            <button
              onClick={onKill}
              className="text-xs text-danger hover:bg-danger/10 px-2 py-1 rounded transition-colors"
            >
              Kill
            </button>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-black/40"
      >
        {logs.length === 0 ? (
          <div className="text-ink-3 italic">Waiting for stream to start...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 shrink-0 opacity-80">
                {getLogIcon(log.type)}
              </div>
              <div className={cn("flex-1 whitespace-pre-wrap leading-relaxed", getLogColor(log.type))}>
                {log.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
