"use client";

import { maturityLevels } from "@/lib/scan/definition/maturity-levels";

interface MaturityLegendProps {
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
}

export function MaturityLegend({ orientation = "horizontal", compact = false }: MaturityLegendProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {maturityLevels.map((level) => (
          <div key={level.level} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-gray-600">
              {level.level}. {level.shortLabel}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (orientation === "vertical") {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Volwassenheidsniveaus (1-5)
        </h4>
        <div className="space-y-2">
          {maturityLevels.map((level) => (
            <div key={level.level} className="flex items-start gap-2">
              <div
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: level.color }}
              >
                {level.level}
              </div>
              <div>
                <span className="font-medium text-gray-900">{level.label}</span>
                <p className="text-xs text-gray-500">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Volwassenheidsniveaus (1-5)
      </h4>
      <div className="grid grid-cols-5 gap-2">
        {maturityLevels.map((level) => (
          <div
            key={level.level}
            className="rounded-lg p-2 text-center"
            style={{ backgroundColor: level.bgColor }}
          >
            <div
              className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: level.color }}
            >
              {level.level}
            </div>
            <div className="text-xs font-semibold" style={{ color: level.color }}>
              {level.shortLabel}
            </div>
            <p className="mt-1 text-[10px] leading-tight text-gray-500">
              {level.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
