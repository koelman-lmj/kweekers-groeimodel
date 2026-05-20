"use client";

import { maturityLevels } from "@/lib/scan/definition/maturity-levels";

interface MaturityDotsProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function MaturityDots({ score, size = "md", showLabels = false }: MaturityDotsProps) {
  const roundedScore = Math.round(score);
  
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const gapClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  return (
    <div className={`flex items-center ${gapClasses[size]}`}>
      {maturityLevels.map((level) => {
        const isActive = level.level <= roundedScore;
        const isCurrent = level.level === roundedScore;
        
        return (
          <div
            key={level.level}
            className={`
              ${sizeClasses[size]} 
              rounded-full 
              transition-all
              ${isActive 
                ? `bg-[${level.color}]` 
                : "bg-gray-200"
              }
              ${isCurrent ? "ring-2 ring-offset-1 ring-gray-400" : ""}
            `}
            style={{ 
              backgroundColor: isActive ? level.color : "#e5e7eb",
            }}
            title={`${level.level}. ${level.label}`}
          />
        );
      })}
      {showLabels && score > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {maturityLevels.find((l) => l.level === roundedScore)?.label || ""}
        </span>
      )}
    </div>
  );
}
