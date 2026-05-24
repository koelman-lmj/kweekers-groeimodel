"use client";

import { getMaturityColor, getMaturityLabel } from "@/lib/scan/definition/maturity-levels";

interface TotalScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TotalScoreCircle({ 
  score, 
  maxScore = 3, 
  size = "md",
  showLabel = true 
}: TotalScoreCircleProps) {
  const percentage = (score / maxScore) * 100;
  const color = getMaturityColor(score);
  const maturityLabel = getMaturityLabel(score);
  
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: "text-xl", labelSize: "text-xs" },
    md: { width: 120, strokeWidth: 8, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { width: 160, strokeWidth: 10, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.width}
        height={config.width}
        className="-rotate-90 transform"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`${config.fontSize} font-bold`} style={{ color }}>
          {score.toFixed(1)}
        </span>
        {showLabel && (
          <span className={`${config.labelSize} text-muted-foreground`}>
            {maturityLabel}
          </span>
        )}
      </div>
    </div>
  );
}
