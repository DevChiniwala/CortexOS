import * as React from "react"

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
}

export function Sparkline({ 
  data, 
  color = "currentColor", 
  width = 100, 
  height = 30, 
  strokeWidth = 2,
  className 
}: SparklineProps) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const padding = strokeWidth
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  // Scale points to SVG coordinates
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth
    // Invert Y axis because SVG 0,0 is top-left
    const y = padding + innerHeight - ((val - min) / range) * innerHeight
    return `${x},${y}`
  }).join(" L ")

  const pathD = `M ${points}`
  
  // Create an area under the curve for a fill effect
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      
      <path 
        d={areaD} 
        fill={`url(#gradient-${color})`} 
      />
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="drop-shadow-md"
      />
    </svg>
  )
}
