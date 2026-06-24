import * as React from "react"
import { NavLink } from "react-router-dom"
import { IconBuilding, IconUsers, IconBrain, IconSettings, IconWaveSine, IconTerminal2, IconNetwork, IconHierarchy, IconSend, IconTarget, IconCircleCheck, IconPlus, IconPlugConnected, IconMessage, IconCurrencyDollar, IconTool, IconShoppingCart } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const MAIN_NAV = [
  { icon: IconTerminal2, label: "Dashboard", path: "/dashboard" },
  { icon: IconBuilding, label: "Companies", path: "/companies" },
  { icon: IconUsers, label: "Contacts", path: "/contacts" },
  { icon: IconWaveSine, label: "Signals", path: "/signals" },
  { icon: IconSend, label: "Outreach", path: "/outreach" },
  { icon: IconMessage, label: "Channels", path: "/channels" },
  { icon: IconCurrencyDollar, label: "Revenue", path: "/revenue" },
]

const SYSTEM_NAV = [
  { icon: IconBrain, label: "Agents", path: "/agents" },
  { icon: IconTarget, label: "ICP Config", path: "/icp" },
  { icon: IconPlugConnected, label: "Integrations", path: "/integrations" },
  { icon: IconNetwork, label: "Memory Graph", path: "/memory" },
  { icon: IconHierarchy, label: "Flow Builder", path: "/flow" },
  { icon: IconTool, label: "Agent Builder", path: "/agent-builder" },
  { icon: IconShoppingCart, label: "Marketplace", path: "/marketplace" },
  { icon: IconSettings, label: "Settings", path: "/settings" },
]

export function Sidebar() {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false)

  return (
    <aside className="w-[280px] h-screen bg-surface border-r border-line flex flex-col pt-6 pb-4">
      <div className="px-6 mb-8">
        <button 
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-full flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              GTM
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-sm font-semibold text-ink leading-tight tracking-tight">Acme Corp GTM</h2>
              <span className="text-[10px] text-ink-3 uppercase font-medium tracking-wider">Enterprise Plan</span>
            </div>
          </div>
          <svg className={cn("w-4 h-4 text-ink-3 transition-transform", isWorkspaceMenuOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isWorkspaceMenuOpen && (
          <div className="absolute top-20 left-4 w-[248px] bg-surface border border-line rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-ink-3 uppercase tracking-wider">Your Workspaces</div>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg bg-surface-hover text-left">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                GTM
              </div>
              <span className="text-sm font-medium text-ink">Acme Corp GTM</span>
              <IconCircleCheck className="w-4 h-4 text-primary ml-auto" />
            </button>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-surface-hover transition-colors text-left">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[10px]">
                EU
              </div>
              <span className="text-sm font-medium text-ink-2">Acme Corp EMEA</span>
            </button>
            <div className="h-px bg-line my-1" />
            <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-surface-hover transition-colors text-left text-sm font-medium text-ink-2">
              <IconPlus className="w-4 h-4" />
              Create Workspace
            </button>
          </div>
        )}
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
