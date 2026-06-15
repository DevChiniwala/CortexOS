import { create } from "zustand"
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react"

export type AppNode = Node

export type AppState = {
  nodes: AppNode[]
  edges: Edge[]
  onNodesChange: OnNodesChange<AppNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  addNode: (node: AppNode) => void
  setNodes: (nodes: AppNode[]) => void
  setEdges: (edges: Edge[]) => void
}

const initialNodes: AppNode[] = [
  {
    id: "trigger-1",
    type: "cortexNode",
    position: { x: 250, y: 100 },
    data: { 
      label: "Find ICP Leads", 
      icon: "users",
      color: "blue",
      description: "Search Apollo for VP Eng" 
    },
  },
  {
    id: "action-1",
    type: "cortexNode",
    position: { x: 250, y: 250 },
    data: { 
      label: "Deep Research", 
      icon: "search",
      color: "orange",
      description: "Extract funding & stack" 
    },
  },
  {
    id: "action-2",
    type: "cortexNode",
    position: { x: 250, y: 400 },
    data: { 
      label: "Signal Scorer", 
      icon: "trending-up",
      color: "yellow",
      description: "Evaluate against Tier 1" 
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "trigger-1", target: "action-1", animated: true },
  { id: "e2-3", source: "action-1", target: "action-2", animated: true },
]

export const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    })
  },
  addNode: (node: AppNode) => {
    set({ nodes: [...get().nodes, node] })
  },
  setNodes: (nodes: AppNode[]) => {
    set({ nodes })
  },
  setEdges: (edges: Edge[]) => {
    set({ edges })
  },
}))
