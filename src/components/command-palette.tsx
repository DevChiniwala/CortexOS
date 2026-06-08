import * as React from "react"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { IconSearch, IconBuilding, IconUsers, IconBrain, IconSettings, IconWaveSine, IconTerminal2 } from "@tabler/icons-react"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      <Command
        className="relative z-50 w-full max-w-[600px] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl animate-in zoom-in-95 duration-200"
        label="Global Command Palette"
      >
        <div className="flex items-center border-b border-line px-3" cmdk-input-wrapper="">
          <IconSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input 
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-50 text-ink"
            placeholder="Type a command or search..."
            autoFocus
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm text-ink-2">No results found.</Command.Empty>
          <Command.Group heading="Navigation" className="text-xs font-medium text-ink-3 px-2 py-1.5">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/dashboard"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-ink-2 hover:text-ink"
            >
              <IconTerminal2 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/companies"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-ink-2 hover:text-ink"
            >
              <IconBuilding className="mr-2 h-4 w-4" />
              <span>Companies</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/contacts"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-ink-2 hover:text-ink"
            >
              <IconUsers className="mr-2 h-4 w-4" />
              <span>Contacts</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/signals"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-ink-2 hover:text-ink"
            >
              <IconWaveSine className="mr-2 h-4 w-4" />
              <span>Signals</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/agents"))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-ink-2 hover:text-ink"
            >
              <IconBrain className="mr-2 h-4 w-4" />
              <span>Agents</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
