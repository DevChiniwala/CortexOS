import { NavLink } from "react-router-dom";
import { 
  IconLayoutDashboard, 
  IconRobot, 
  IconBrain, 
  IconActivity, 
  IconRoute, 
  IconFlask, 
  IconChartBar, 
  IconTerminal2, 
  IconShieldCheck 
} from "@tabler/icons-react";

export function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: <IconLayoutDashboard size={18} />, path: "/dashboard" },
    { label: "Cortex Agents", icon: <IconRobot size={18} />, path: "/agents" },
    { label: "Cortex Memory", icon: <IconBrain size={18} />, path: "/memory" },
    { label: "Cortex Signals", icon: <IconActivity size={18} />, path: "/signals" },
    { label: "Cortex Flow", icon: <IconRoute size={18} />, path: "/flow" },
    { label: "Cortex Labs", icon: <IconFlask size={18} />, path: "/labs" },
    { label: "Cortex Intelligence", icon: <IconChartBar size={18} />, path: "/intelligence" },
    { label: "Cortex Stream", icon: <IconTerminal2 size={18} />, path: "/stream" },
    { label: "Cortex Verify", icon: <IconShieldCheck size={18} />, path: "/verify" },
  ];

  return (
    <aside className="w-64 h-screen shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] flex flex-col">
      <div className="h-14 flex items-center px-6 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--color-primary)] flex items-center justify-center font-bold text-black text-xs">C</div>
          <span className="font-display font-semibold tracking-tight text-lg">CortexOS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="px-3 mb-2 text-xs font-mono text-[var(--color-ink-3)] uppercase tracking-wider">Workspace</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? "bg-[var(--color-line)] text-white" 
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-hover)] hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--color-line)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-line)] flex items-center justify-center">
            <span className="text-xs font-medium">OP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Operator - Host</span>
            <span className="text-xs text-[var(--color-ink-3)]">Modify User</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
