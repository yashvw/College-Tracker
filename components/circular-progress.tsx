"use client"

interface CircularProgressProps {
  percentage: number
  glowColor?: string
}

export default function CircularProgress({ percentage, glowColor = "#22c55e" }: CircularProgressProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="transform -rotate-90">
        {/* Background circle */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-500"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute flex items-center justify-center w-32 h-32">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  )
}
