import { motion } from "motion/react"

interface TrustScoreRingProps {
  score: number  // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  verified?: number
  total?: number
}

export function TrustScoreRing({ 
  score, 
  size = 80, 
  strokeWidth = 6, 
  className = "",
  showLabel = true,
  verified,
  total,
}: TrustScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  // Color shifts: red → yellow → green
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#00D084", text: "text-leaf", label: "High Trust" }
    if (s >= 60) return { stroke: "#FFB020", text: "text-warning", label: "Moderate" }
    if (s >= 40) return { stroke: "#FF8C00", text: "text-flame-2", label: "Low Trust" }
    return { stroke: "#F43F5E", text: "text-danger", label: "Unverified" }
  }

  const { stroke, text, label } = getColor(score)

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={strokeWidth}
          />
        </svg>
        {/* Progress ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-display font-semibold ${text}`}>{score}%</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <div className={`text-xs font-semibold tracking-wider uppercase ${text}`}>{label}</div>
          {verified !== undefined && total !== undefined && (
            <div className="text-[10px] text-ink-3 mt-0.5">{verified}/{total} claims verified</div>
          )}
        </div>
      )}
    </div>
  )
}
