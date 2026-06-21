import * as React from "react"
import { NavLink } from "react-router-dom"
import { IconBuilding, IconUsers, IconBrain, IconSettings, IconWaveSine, IconTerminal2, IconNetwork, IconHierarchy, IconSend } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const MAIN_NAV = [
  { icon: IconTerminal2, label: "Dashboard", path: "/dashboard" },
  { icon: IconBuilding, label: "Companies", path: "/companies" },
  { icon: IconUsers, label: "Contacts", path: "/contacts" },
  { icon: IconWaveSine, label: "Signals", path: "/signals" },
  { icon: IconSend, label: "Outreach", path: "/outreach" },
]

const SYSTEM_NAV = [
  { icon: IconBrain, label: "Agents", path: "/agents" },
  { icon: IconNetwork, label: "Memory Graph", path: "/memory" },
  { icon: IconHierarchy, label: "Flow Builder", path: "/flow" },
  { icon: IconSettings, label: "Settings", path: "/settings" },
]

export function Sidebar() {
  return (
    <aside className="w-[280px] h-screen bg-surface border-r border-line flex flex-col pt-6 pb-4">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <img src="/logo.png" alt="CortexOS Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-xl font-display font-semibold text-ink tracking-tight">CortexOS</h2>
      </div>

      <div className="flex-1 px-4 space-y-8">
        <div>
          <div className="px-2 mb-2 text-xs font-mono text-ink-3 uppercase tracking-wider">Intelligence</div>
          <nav className="space-y-1">
            {MAIN_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-ink-2 hover:bg-surface-hover hover:text-ink"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <div className="px-2 mb-2 text-xs font-mono text-ink-3 uppercase tracking-wider">System Core</div>
          <nav className="space-y-1">
            {SYSTEM_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-ink-2 hover:bg-surface-hover hover:text-ink"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-6 mt-auto">
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-surface-hover border border-line cursor-pointer hover:border-line-hover transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-flame flex items-center justify-center text-white font-medium text-sm">
            D
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ink leading-tight">Dev</span>
            <span className="text-xs text-ink-3">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
