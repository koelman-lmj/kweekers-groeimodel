"use client";

import {
  ClipboardList,
  BarChart3,
  Target,
  Map,
  Briefcase,
  RefreshCw,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Nulmeting",
    description: "We brengen de huidige situatie in kaart met het HIMS-assessment op modules, integraties, rapportage en organisatiematuriteit.",
    icon: ClipboardList,
    color: "#3f4e87",
  },
  {
    number: 2,
    title: "Score & Inzicht",
    description: "Resultaat: een maturity score (1-5) per onderdeel en totaaloverzicht. Helder zicht op sterke punten en groeikansen.",
    icon: BarChart3,
    color: "#3f4e87",
  },
  {
    number: 3,
    title: "Gap & Ambitie",
    description: "Samen bepalen we de gewenste ambitie en prioritaire gaps. Van stap X naar stap Y: wat is er nodig?",
    icon: Target,
    color: "#ed6e41",
  },
  {
    number: 4,
    title: "Roadmap",
    description: "Een 2-3 jarige roadmap met mijlpalen, acties, impact en afhankelijkheden op AFAS, integraties, data, rapportage en organisatie.",
    icon: Map,
    color: "#ed6e41",
  },
  {
    number: 5,
    title: "Werkvoorraad",
    description: "Van roadmap naar concrete werkvoorraad per kwartaal/sprint. Focus op maximale waarde & impact.",
    icon: Briefcase,
    color: "#10b981",
  },
  {
    number: 6,
    title: "Meten & Bijsturen",
    description: "Periodiek her-meten op alle thema's. Continue verbetering en groei naar het volgende volwassenheidsniveau.",
    icon: RefreshCw,
    color: "#10b981",
  },
];

interface ProcessStepsProps {
  currentStep?: number;
  compact?: boolean;
}

export function ProcessSteps({ currentStep = 2, compact = false }: ProcessStepsProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl bg-[#f8f9fa] p-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.number === currentStep;
          const isPast = step.number < currentStep;
          
          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                  ${isActive ? "bg-[var(--kweekers-accent)] text-white" : ""}
                  ${isPast ? "bg-[var(--kweekers-primary)] text-white" : ""}
                  ${!isActive && !isPast ? "bg-gray-200 text-gray-500" : ""}
                `}
              >
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="mx-2 h-0.5 w-4 bg-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Hoe het werkt
      </div>
      <div className="grid grid-cols-6 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.number === currentStep;
          
          return (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                {/* Step number badge */}
                <div
                  className={`
                    mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                    ${isActive 
                      ? "bg-[var(--kweekers-accent)] text-white ring-2 ring-[var(--kweekers-accent)] ring-offset-2" 
                      : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {step.number}
                </div>
                
                {/* Icon */}
                <div
                  className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ 
                    backgroundColor: isActive ? `${step.color}15` : "#f3f4f6",
                  }}
                >
                  <Icon 
                    className="h-6 w-6" 
                    style={{ color: isActive ? step.color : "#9ca3af" }}
                  />
                </div>
                
                {/* Title */}
                <h4 className={`text-xs font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                  {step.title}
                </h4>
                
                {/* Description (hidden on smaller views) */}
                <p className="mt-1 hidden text-[10px] leading-tight text-gray-400 lg:block">
                  {step.description}
                </p>
              </div>
              
              {/* Connector arrow */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-10 translate-x-1/2 text-gray-300">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M0 6H14M14 6L9 1M14 6L9 11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
