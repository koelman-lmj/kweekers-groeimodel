"use client";

import type { RoadmapItem } from "@/lib/scan/types";
import { pillars } from "@/lib/scan/definition/pillars";

interface RoadmapTimelineProps {
  items: RoadmapItem[];
  years?: number;
}

export function RoadmapTimeline({ items, years = 3 }: RoadmapTimelineProps) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  
  // Group items by pillar
  const itemsByPillar = pillars.map((pillar) => ({
    pillar,
    items: items.filter((item) => item.pillarCode === pillar.code),
  }));

  // Calculate progress per pillar per year
  const getProgressForYear = (pillarCode: string, year: number) => {
    const pillarItems = items.filter((item) => item.pillarCode === pillarCode);
    const yearItems = pillarItems.filter((item) => item.year <= year);
    const completedItems = yearItems.filter((item) => item.isCompleted);
    
    if (pillarItems.length === 0) return 0;
    return (yearItems.length / pillarItems.length) * 100;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Voorbeeld Roadmap 2-3 Jaar
      </h4>
      
      {/* Header with years and quarters */}
      <div className="mb-3 grid grid-cols-[120px_1fr] gap-4">
        <div /> {/* Empty cell for pillar labels */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${years}, 1fr)` }}>
          {Array.from({ length: years }).map((_, yearIndex) => (
            <div key={yearIndex} className="text-center">
              <div className="mb-1 text-xs font-semibold text-gray-700">
                Jaar {yearIndex + 1}
              </div>
              <div className="grid grid-cols-4 gap-0.5">
                {quarters.map((q) => (
                  <div key={q} className="text-[10px] text-gray-400">
                    {q}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar rows */}
      <div className="space-y-2">
        {itemsByPillar
          .filter((p) => p.items.length > 0)
          .map(({ pillar, items: pillarItems }) => (
            <div key={pillar.code} className="grid grid-cols-[120px_1fr] items-center gap-4">
              {/* Pillar label */}
              <div
                className="rounded-md px-2 py-1 text-xs font-medium text-white truncate"
                style={{ backgroundColor: pillar.color }}
              >
                {pillar.label}
              </div>
              
              {/* Timeline bar */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${years}, 1fr)` }}>
                {Array.from({ length: years }).map((_, yearIndex) => {
                  const progress = getProgressForYear(pillar.code, yearIndex + 1);
                  const yearItems = pillarItems.filter((item) => item.year === yearIndex + 1);
                  
                  return (
                    <div key={yearIndex} className="relative h-6">
                      {/* Background */}
                      <div className="absolute inset-0 rounded bg-gray-100" />
                      
                      {/* Progress bar */}
                      {yearItems.length > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 rounded"
                          style={{
                            backgroundColor: `${pillar.color}40`,
                            width: `${Math.min(progress, 100)}%`,
                          }}
                        />
                      )}
                      
                      {/* Activity dots */}
                      <div className="absolute inset-0 flex items-center justify-around px-1">
                        {yearItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className="h-3 w-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: pillar.color }}
                            title={item.title}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-gray-300" />
          <span>Gepland</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[var(--kweekers-accent)]" />
          <span>Actief</span>
        </div>
      </div>
    </div>
  );
}
