"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TotalScore } from "@/lib/scan/types";

interface RadarChartProps {
  scores: TotalScore;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function RadarChart({ scores, size = "md", showLabels = true }: RadarChartProps) {
  const data = scores.pillars.map((pillar) => ({
    pillar: pillar.label,
    score: pillar.score || 0,
    fullMark: 5,
    color: pillar.color,
  }));

  const sizeConfig = {
    sm: { height: 200, fontSize: 10 },
    md: { height: 300, fontSize: 11 },
    lg: { height: 400, fontSize: 12 },
  };

  const config = sizeConfig[size];

  return (
    <div className="w-full" style={{ height: config.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ 
              fill: "#6b7280", 
              fontSize: config.fontSize,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickCount={6}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3f4e87"
            fill="#3f4e87"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
                    <p className="font-medium text-gray-900">{data.pillar}</p>
                    <p className="text-sm text-gray-600">
                      Score: <span className="font-semibold">{data.score.toFixed(1)}</span> / 5
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
