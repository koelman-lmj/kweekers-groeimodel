"use client";

import {
  TrendingUp,
  CheckCircle,
  Eye,
  Zap,
  Heart,
} from "lucide-react";

const impactDimensions = [
  {
    icon: TrendingUp,
    label: "Efficientie & Kostenbesparing",
    color: "#3f4e87",
  },
  {
    icon: CheckCircle,
    label: "Kwaliteit & Foutenreductie",
    color: "#10b981",
  },
  {
    icon: Eye,
    label: "Inzicht & Sturing",
    color: "#f59e0b",
  },
  {
    icon: Zap,
    label: "Wendbaarheid & Groei",
    color: "#ed6e41",
  },
  {
    icon: Heart,
    label: "Medewerker- & Klanttevredenheid",
    color: "#ec4899",
  },
];

interface ImpactDimensionsProps {
  orientation?: "horizontal" | "vertical";
}

export function ImpactDimensions({ orientation = "vertical" }: ImpactDimensionsProps) {
  if (orientation === "horizontal") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {impactDimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div key={dim.label} className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: dim.color }} />
              <span className="text-sm text-gray-700">{dim.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Impact Dimensies
      </h4>
      <div className="space-y-2">
        {impactDimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div key={dim.label} className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded"
                style={{ backgroundColor: `${dim.color}15` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: dim.color }} />
              </div>
              <span className="text-sm text-gray-700">{dim.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
