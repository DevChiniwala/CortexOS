import * as React from "react";
import { IconShoppingCart, IconDownload, IconStar, IconSearch, IconFilter, IconCheck } from "@tabler/icons-react";
import { fetchCommunityAgents, installAgent, CommunityAgent } from "@/lib/api/marketplace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Marketplace() {
  const [agents, setAgents] = React.useState<CommunityAgent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [installingId, setInstallingId] = React.useState<string | null>(null);
  const [installedIds, setInstalledIds] = React.useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = React.useState<string>("All");

  React.useEffect(() => {
    fetchCommunityAgents().then(data => {
      setAgents(data);
      setLoading(false);
    });
  }, []);

  const handleInstall = async (agent: CommunityAgent) => {
    setInstallingId(agent.id);
    const success = await installAgent(agent.id);
    if (success) {
      setInstalledIds(prev => new Set(prev).add(agent.id));
    }
    setInstallingId(null);
  };

  const categories = ["All", "Lead Enrichment", "Vertical-Specific Outreach", "Competitor Intel"];

  const filteredAgents = activeCategory === "All" 
    ? agents 
    : agents.filter(a => a.category === activeCategory);

  return (
    <div className="flex-1 overflow-auto bg-background text-ink p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink flex items-center gap-3">
              <IconShoppingCart className="w-8 h-8 text-primary" />
              Community Marketplace
            </h1>
            <p className="text-ink-2 mt-2">Discover, install, and share custom GTM agents built by the community.</p>
          </div>
          
          <div className="relative">
            <IconSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input 
              type="text" 
              placeholder="Search agents..." 
              className="pl-10 pr-4 py-2 bg-surface border border-line rounded-lg focus:outline-none focus:border-primary text-sm w-64 text-ink"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2">
          <IconFilter className="w-4 h-4 text-ink-3 mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-surface border border-line text-ink-2 hover:bg-surface-hover hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <Card key={agent.id} className="bg-surface/50 border-line/50 hover:border-primary/30 transition-all group flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
                        {agent.category}
                      </div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      {agent.price === 0 ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">FREE</span>
                      ) : (
                        <span className="text-xs font-bold text-ink bg-surface px-2 py-1 rounded border border-line">${agent.price}</span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-2 line-clamp-2 text-ink-2 h-10">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="mt-auto pt-0">
                  <div className="flex items-center justify-between mb-4 text-xs text-ink-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[8px]">
                        {agent.creator.charAt(0)}
                      </div>
                      <span>{agent.creator}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><IconDownload className="w-3.5 h-3.5" /> {(agent.downloads / 1000).toFixed(1)}k</span>
                      <span className="flex items-center gap-1 text-amber-400"><IconStar className="w-3.5 h-3.5 fill-amber-400" /> {agent.rating}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleInstall(agent)}
                    disabled={installingId === agent.id || installedIds.has(agent.id)}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      installedIds.has(agent.id)
                        ? "bg-surface-hover text-emerald-400 border border-emerald-500/20"
                        : "bg-surface border border-line hover:border-primary hover:text-primary text-ink-2"
                    }`}
                  >
                    {installingId === agent.id ? (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    ) : installedIds.has(agent.id) ? (
                      <>
                        <IconCheck className="w-4 h-4" />
                        Installed
                      </>
                    ) : (
                      <>
                        <IconDownload className="w-4 h-4" />
                        Install Agent
                      </>
                    )}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
