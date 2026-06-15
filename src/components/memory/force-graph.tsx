import * as React from "react"
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d"

export interface GraphNode {
  id: string
  label: string
  group: "company" | "person" | "signal" | "topic"
  val?: number // Size
  color?: string
  data?: any
}

export interface GraphLink {
  source: string
  target: string
  label?: string
}

interface InteractiveGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
  onNodeClick?: (node: GraphNode) => void
  width?: number
  height?: number
}

export function InteractiveGraph({ nodes, links, onNodeClick, width, height }: InteractiveGraphProps) {
  const fgRef = React.useRef<ForceGraphMethods>()
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const [dimensions, setDimensions] = React.useState({ width: width || 800, height: height || 600 })

  React.useEffect(() => {
    if (width && height) return
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setDimensions({ width: clientWidth, height: clientHeight || 600 })
      }
    }
    
    window.addEventListener("resize", updateDimensions)
    updateDimensions()
    
    // Slight delay to ensure parent has rendered
    const timeout = setTimeout(updateDimensions, 100)
    
    return () => {
      window.removeEventListener("resize", updateDimensions)
      clearTimeout(timeout)
    }
  }, [width, height])

  React.useEffect(() => {
    // Zoom to fit on initial load
    if (fgRef.current && nodes.length > 0) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 50)
      }, 500)
    }
  }, [nodes.length])

  // Map nodes and links specifically for react-force-graph
  const graphData = React.useMemo(() => {
    // Clone to avoid mutating original props which causes infinite updates
    return {
      nodes: nodes.map(n => ({ ...n })),
      links: links.map(l => ({ ...l }))
    }
  }, [nodes, links])

  const getColor = (group: string) => {
    switch (group) {
      case "company": return "#FF5500" // Primary orange
      case "person": return "#00AEEF" // Info blue
      case "signal": return "#00D084" // Success green
      case "topic": return "#FFB020" // Warning yellow
      default: return "#8B949E" // Gray
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-black rounded-xl border border-line overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="label"
        nodeColor={(node: any) => node.color || getColor(node.group)}
        nodeVal={(node: any) => node.val || (node.group === "company" ? 8 : node.group === "person" ? 5 : 4)}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={(node: any) => onNodeClick?.(node as GraphNode)}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillText(label, node.x, node.y + (node.val || 5) + fontSize);
        }}
      />
    </div>
  )
}
