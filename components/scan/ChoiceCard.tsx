"use client";

import { forwardRef } from "react";

export type ChoiceCardVariant = "single" | "multi";

export interface ChoiceCardProps {
  label: string;
  description?: string;
  isActive: boolean;
  disabled?: boolean;
  variant?: ChoiceCardVariant;
  onClick: () => void;
  className?: string;
  /** Keyboard shortcut number to display (1-9) */
  shortcutNumber?: number;
}

/**
 * Reusable choice card component for scan questions.
 * Supports both single-select (radio) and multi-select (checkbox) modes.
 * 
 * Features:
 * - Left-aligned text with indicator on the left
 * - Bold title with optional description below
 * - Entire card is clickable
 * - Light orange background when selected (not full orange)
 * - Subtle hover states
 * - Focus states for keyboard navigation
 */
export const ChoiceCard = forwardRef<HTMLButtonElement, ChoiceCardProps>(
  function ChoiceCard(
    {
      label,
      description,
      isActive,
      disabled = false,
      variant = "single",
      onClick,
      className = "",
      shortcutNumber,
    },
    ref
  ) {
    const baseClasses = `
      group relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-[#ed6e41]/30 focus:ring-offset-1
    `;

    const stateClasses = disabled
      ? "border-black/10 bg-white/50 text-muted-foreground opacity-60 cursor-not-allowed"
      : isActive
        ? "border-[#ed6e41] bg-[#fef3ef] shadow-sm"
        : "border-black/10 bg-white hover:border-[#ed6e41]/40 hover:bg-[#fef8f6]";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isActive}
        className={`${baseClasses} ${stateClasses} ${className}`}
      >
        {/* Selection indicator */}
        <div className="mt-0.5 flex-shrink-0">
          {variant === "single" ? (
            <RadioIndicator isActive={isActive} disabled={disabled} />
          ) : (
            <CheckboxIndicator isActive={isActive} disabled={disabled} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-sm font-semibold leading-5 ${
                isActive ? "text-[#c45528]" : disabled ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {label}
            </span>
            {shortcutNumber && shortcutNumber <= 9 && (
              <kbd className="hidden shrink-0 rounded border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
                {shortcutNumber}
              </kbd>
            )}
          </div>
          {description && (
            <p
              className={`mt-0.5 text-xs leading-relaxed ${
                isActive ? "text-[#a86b4e]" : "text-muted-foreground"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </button>
    );
  }
);

/** Radio button indicator for single-select questions */
function RadioIndicator({
  isActive,
  disabled,
}: {
  isActive: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
        isActive
          ? "border-[#ed6e41] bg-[#ed6e41]"
          : disabled
            ? "border-black/15 bg-white"
            : "border-black/20 bg-white group-hover:border-[#ed6e41]/50"
      }`}
    >
      {isActive && (
        <div className="h-2 w-2 rounded-full bg-white" />
      )}
    </div>
  );
}

/** Checkbox indicator for multi-select questions */
function CheckboxIndicator({
  isActive,
  disabled,
}: {
  isActive: boolean;
  disabled: boolean;
}) {
  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
        isActive
          ? "border-[#ed6e41] bg-[#ed6e41]"
          : disabled
            ? "border-black/15 bg-white"
            : "border-black/20 bg-white group-hover:border-[#ed6e41]/50"
      }`}
    >
      {isActive && (
        <svg
          className="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}

/** Container for choice cards with consistent grid layout */
export function ChoiceCardGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  /** Number of columns on desktop (1 or 2). Always 1 on mobile. */
  columns?: 1 | 2;
}) {
  return (
    <div
      className={`grid gap-2 ${
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {children}
    </div>
  );
}

/** Compact inline pill variant for grouped multi-select (e.g., AFAS products) */
export function ChoicePill({
  label,
  isActive,
  disabled = false,
  onClick,
}: {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#ed6e41]/30 ${
        isActive
          ? "border-[#ed6e41] bg-[#fef3ef] font-medium text-[#c45528]"
          : disabled
            ? "border-black/10 bg-white text-muted-foreground opacity-50 cursor-not-allowed"
            : "border-black/15 bg-white hover:border-[#ed6e41]/40 hover:bg-[#fef8f6]"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          isActive
            ? "border-[#ed6e41] bg-[#ed6e41] text-white"
            : "border-black/20 bg-white"
        }`}
      >
        {isActive && (
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
