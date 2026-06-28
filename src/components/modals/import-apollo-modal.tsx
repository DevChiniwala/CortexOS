import * as React from "react"
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { searchApolloCompanies, importApolloCompany, type ApolloCompany } from "@/lib/api/apollo"
import { IconSearch, IconBuilding, IconDownload } from "@tabler/icons-react"
import { toast } from "sonner"

interface ImportApolloModalProps {
  open: boolean
  onClose: () => void
}

export function ImportApolloModal({ open, onClose }: ImportApolloModalProps) {
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<ApolloCompany[]>([])
  const [importingStates, setImportingStates] = React.useState<Record<string, boolean>>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const companies = await searchApolloCompanies(query)
      setResults(companies)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to search Apollo")
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (company: ApolloCompany) => {
    const key = company.name
    setImportingStates(prev => ({ ...prev, [key]: true }))
    try {
      await importApolloCompany(company)
      toast.success(`Imported ${company.name}`)
      onClose() // Close on first successful import, or we could let them import multiple
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import company")
    } finally {
      setImportingStates(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <DialogTitle>Import from Apollo</DialogTitle>
      </DialogHeader>

      <DialogBody className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies by name or domain..."
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isSearching || !query.trim()} className="mt-6">
            {isSearching ? "Searching..." : <><IconSearch className="w-4 h-4 mr-2" /> Search</>}
          </Button>
        </form>

        <div className="border border-line rounded-xl overflow-hidden bg-surface/50 max-h-96 overflow-y-auto">
          {results.length === 0 && !isSearching && query && (
            <div className="p-8 text-center text-ink-3">No results found for "{query}"</div>
          )}
          {results.length === 0 && !isSearching && !query && (
            <div className="p-8 text-center text-ink-3">Enter a search query to find live companies.</div>
          )}
          {results.map((company, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-surface border-b border-line/50 last:border-0 transition-colors">
              <div className="w-10 h-10 rounded bg-bg border border-line flex items-center justify-center shrink-0 overflow-hidden">
                <IconBuilding className="w-5 h-5 text-ink-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">{company.name}</div>
                <div className="text-sm text-ink-2 truncate">
                  {company.website_url || company.primary_domain || "No website"}
                  {company.estimated_num_employees ? ` • ~${company.estimated_num_employees} employees` : ""}
                </div>
                {company.short_description && (
                  <div className="text-xs text-ink-3 truncate mt-1">{company.short_description}</div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={importingStates[company.name]}
                onClick={() => handleImport(company)}
              >
                {importingStates[company.name] ? "Importing..." : <><IconDownload className="w-4 h-4 mr-1" /> Import</>}
              </Button>
            </div>
          ))}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
