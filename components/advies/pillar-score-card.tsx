"use client";

import type { PillarScore } from "@/lib/scan/types";
import { MaturityDots } from "./maturity-dots";
import {
  Grid3X3,
  Link,
  BarChart3,
  Building2,
  Users,
  Euro,
  Contact,
  FolderOpen,
  ShoppingCart,
  Repeat,
  Truck,
  Monitor,
  Plug,
  ArrowLeftRight,
  Database,
  GitBranch,
  Shield,
  Activity,
  FileText,
  Gauge,
  CheckCircle,
  UserCog,
  TrendingUp,
  Lightbulb,
  Target,
  Workflow,
  Users2,
  RefreshCw,
  Award,
  MessageCircle,
  Compass,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "grid-3x3": Grid3X3,
  link: Link,
  "bar-chart-3": BarChart3,
  "building-2": Building2,
  users: Users,
  euro: Euro,
  contact: Contact,
  folder: FolderOpen,
  "shopping-cart": ShoppingCart,
  repeat: Repeat,
  truck: Truck,
  monitor: Monitor,
  plug: Plug,
  "arrow-left-right": ArrowLeftRight,
  database: Database,
  "git-branch": GitBranch,
  shield: Shield,
  activity: Activity,
  "file-text": FileText,
  gauge: Gauge,
  "check-circle": CheckCircle,
  "user-cog": UserCog,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
  target: Target,
  workflow: Workflow,
  "users-2": Users2,
  "refresh-cw": RefreshCw,
  award: Award,
  "message-circle": MessageCircle,
  compass: Compass,
};

interface PillarScoreCardProps {
  pillar: PillarScore;
  pillarIcon?: string;
}

export function PillarScoreCard({ pillar, pillarIcon }: PillarScoreCardProps) {
  const PillarIcon = pillarIcon ? iconMap[pillarIcon] : Grid3X3;

  // Filter sub-dimensions that have scores
  const scoredSubDimensions = pillar.subDimensions.filter(
    (s) => s.score > 0 || s.questionCount > 0
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${pillar.color}15` }}
        >
          {PillarIcon && (
            <PillarIcon className="h-5 w-5" style={{ color: pillar.color }} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pillar.label}</h3>
          <p className="text-xs text-muted-foreground">{pillar.description}</p>
        </div>
      </div>

      {/* Sub-dimensions with scores */}
      <div className="space-y-2">
        {scoredSubDimensions.map((subDim) => (
          <div key={subDim.code} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate max-w-[60%]">
              {subDim.label}
            </span>
            <MaturityDots score={subDim.score} size="sm" />
          </div>
        ))}

        {scoredSubDimensions.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Geen scores beschikbaar
          </p>
        )}
      </div>

      {/* Footer with average */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium text-gray-600">Gemiddelde</span>
        <div className="flex items-center gap-2">
          <MaturityDots score={pillar.score} size="md" />
          <span
            className="text-lg font-bold"
            style={{ color: pillar.color }}
          >
            {pillar.score > 0 ? pillar.score.toFixed(1) : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
