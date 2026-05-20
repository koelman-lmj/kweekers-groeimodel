"use client";

import { useState, useEffect } from "react";
import { useScan } from "@/app/context/ScanContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Check,
  X,
  Printer,
  Download,
} from "lucide-react";

import type { RoadmapItem, RoadmapPriority, RoadmapQuarter, RoadmapYear } from "@/lib/scan/types";
import { buildPillarScores, generateDemoScores } from "@/lib/scan/engine/build-pillar-scores";
import { generateRoadmap, generateDemoRoadmap } from "@/lib/scan/engine/generate-roadmap";
import { pillars, getPillar } from "@/lib/scan/definition/pillars";
import { maturityLevels } from "@/lib/scan/definition/maturity-levels";
import { RoadmapTimeline } from "@/components/advies/roadmap-timeline";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const priorityColors: Record<RoadmapPriority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const priorityLabels: Record<RoadmapPriority, string> = {
  high: "Hoog",
  medium: "Gemiddeld",
  low: "Laag",
};

export default function RoadmapPage() {
  const { scan, updateScan } = useScan();
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const scanId = getParam(params.id);

  // Build scores and generate initial roadmap
  const hasAnswers = scan && Object.keys(scan.answers || {}).length > 0;
  const scores = hasAnswers ? buildPillarScores(scan) : generateDemoScores();
  
  // Initialize roadmap from scan state or generate new
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => {
    if (scan?.roadmap?.items && scan.roadmap.items.length > 0) {
      return scan.roadmap.items;
    }
    return hasAnswers ? generateRoadmap(scores) : generateDemoRoadmap();
  });

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Save roadmap to scan state
  useEffect(() => {
    if (updateScan && roadmapItems.length > 0) {
      updateScan({
        roadmap: {
          items: roadmapItems,
          lastModified: new Date().toISOString(),
        },
      });
    }
  }, [roadmapItems, updateScan]);

  const handleToggleComplete = (itemId: string) => {
    setRoadmapItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setRoadmapItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, updates: Partial<RoadmapItem>) => {
    setRoadmapItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    setRoadmapItems((items) => {
      const index = items.findIndex((item) => item.id === itemId);
      if (index === -1) return items;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return items;

      const newItems = [...items];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return newItems;
    });
  };

  const handleAddItem = (newItem: Omit<RoadmapItem, "id">) => {
    const id = `roadmap-${Date.now()}`;
    setRoadmapItems((items) => [...items, { ...newItem, id }]);
    setShowAddForm(false);
  };

  const handleRegenerateRoadmap = () => {
    const newItems = hasAnswers ? generateRoadmap(scores) : generateDemoRoadmap();
    setRoadmapItems(newItems);
  };

  // Group items by year
  const itemsByYear = roadmapItems.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<number, RoadmapItem[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/scan/${scanId}/advies`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar Score & Inzicht
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerateRoadmap}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Opnieuw genereren
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Printen
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--kweekers-primary-dark)]">
            Roadmap Editor
          </h1>
          <p className="text-muted-foreground">
            Pas de automatisch gegenereerde roadmap aan naar jouw wensen.
          </p>
        </div>

        {/* Timeline Preview */}
        <div className="mb-6">
          <RoadmapTimeline items={roadmapItems} />
        </div>

        {/* Roadmap Items by Year */}
        <div className="space-y-6">
          {[1, 2, 3].map((year) => (
            <div key={year} className="rounded-xl border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Jaar {year}</h2>
                <span className="text-sm text-muted-foreground">
                  {itemsByYear[year]?.length || 0} acties
                </span>
              </div>

              {itemsByYear[year]?.length > 0 ? (
                <div className="space-y-3">
                  {itemsByYear[year].map((item, index) => (
                    <RoadmapItemCard
                      key={item.id}
                      item={item}
                      isEditing={editingItem === item.id}
                      onEdit={() => setEditingItem(item.id)}
                      onCancelEdit={() => setEditingItem(null)}
                      onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onToggleComplete={() => handleToggleComplete(item.id)}
                      onMoveUp={() => handleMoveItem(item.id, "up")}
                      onMoveDown={() => handleMoveItem(item.id, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < (itemsByYear[year]?.length || 0) - 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Geen acties gepland voor dit jaar
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="mt-6">
          {showAddForm ? (
            <AddItemForm
              onAdd={handleAddItem}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm text-muted-foreground hover:border-[var(--kweekers-accent)] hover:text-[var(--kweekers-accent)]"
            >
              <Plus className="h-4 w-4" />
              Nieuwe actie toevoegen
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// Roadmap Item Card Component
interface RoadmapItemCardProps {
  item: RoadmapItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<RoadmapItem>) => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function RoadmapItemCard({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleComplete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: RoadmapItemCardProps) {
  const pillar = getPillar(item.pillarCode);
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleSave = () => {
    onUpdate(editedItem);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border-2 border-[var(--kweekers-accent)] bg-white p-4">
        <div className="space-y-3">
          <input
            type="text"
            value={editedItem.title}
            onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Titel"
          />
          <textarea
            value={editedItem.description}
            onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={2}
            placeholder="Beschrijving"
          />
          <div className="grid grid-cols-4 gap-2">
            <select
              value={editedItem.quarter}
              onChange={(e) => setEditedItem({ ...editedItem, quarter: e.target.value as RoadmapQuarter })}
              className="rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
            <select
              value={editedItem.year}
              onChange={(e) => setEditedItem({ ...editedItem, year: Number(e.target.value) as RoadmapYear })}
              className="rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value={1}>Jaar 1</option>
              <option value={2}>Jaar 2</option>
              <option value={3}>Jaar 3</option>
            </select>
            <select
              value={editedItem.priority}
              onChange={(e) => setEditedItem({ ...editedItem, priority: e.target.value as RoadmapPriority })}
              className="rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="high">Hoog</option>
              <option value="medium">Gemiddeld</option>
              <option value="low">Laag</option>
            </select>
            <select
              value={editedItem.pillarCode}
              onChange={(e) => setEditedItem({ ...editedItem, pillarCode: e.target.value })}
              className="rounded-lg border px-2 py-1.5 text-sm"
            >
              {pillars.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancelEdit}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-lg bg-[var(--kweekers-accent)] px-3 py-1.5 text-sm text-white hover:bg-[var(--kweekers-accent-dark)]"
            >
              <Check className="h-4 w-4" />
              Opslaan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border bg-white p-3 ${
        item.isCompleted ? "opacity-60" : ""
      }`}
    >
      {/* Drag handle & Move buttons */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <GripVertical className="h-4 w-4 text-gray-300" />
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Complete checkbox */}
      <button
        onClick={onToggleComplete}
        className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
          item.isCompleted
            ? "border-green-500 bg-green-500"
            : "border-gray-300 hover:border-[var(--kweekers-accent)]"
        }`}
      >
        {item.isCompleted && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={`font-medium text-gray-900 ${
                item.isCompleted ? "line-through" : ""
              }`}
            >
              {item.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
          </div>
          
          {/* Tags */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: pillar?.color || "#666" }}
            >
              {pillar?.label || item.pillarCode}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {item.quarter}
            </span>
            <span
              className="rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: priorityColors[item.priority] }}
            >
              {priorityLabels[item.priority]}
            </span>
          </div>
        </div>

        {/* Maturity levels */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Level {item.currentLevel} → {item.targetLevel}
          </span>
          {item.isAutoGenerated && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
              Auto-gegenereerd
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          Bewerken
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Add Item Form Component
interface AddItemFormProps {
  onAdd: (item: Omit<RoadmapItem, "id">) => void;
  onCancel: () => void;
}

function AddItemForm({ onAdd, onCancel }: AddItemFormProps) {
  const [newItem, setNewItem] = useState<Omit<RoadmapItem, "id">>({
    pillarCode: "afas_modules",
    subDimensionCode: "",
    title: "",
    description: "",
    currentLevel: 2,
    targetLevel: 3,
    quarter: "Q1",
    year: 1,
    priority: "medium",
    isAutoGenerated: false,
    isCompleted: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    onAdd(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-4">
      <h3 className="mb-4 font-semibold text-gray-900">Nieuwe actie toevoegen</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Titel van de actie"
          required
        />
        <textarea
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          rows={2}
          placeholder="Beschrijving"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Pijler</label>
            <select
              value={newItem.pillarCode}
              onChange={(e) => setNewItem({ ...newItem, pillarCode: e.target.value })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              {pillars.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Kwartaal</label>
            <select
              value={newItem.quarter}
              onChange={(e) => setNewItem({ ...newItem, quarter: e.target.value as RoadmapQuarter })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Jaar</label>
            <select
              value={newItem.year}
              onChange={(e) => setNewItem({ ...newItem, year: Number(e.target.value) as RoadmapYear })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value={1}>Jaar 1</option>
              <option value={2}>Jaar 2</option>
              <option value={3}>Jaar 3</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Prioriteit</label>
            <select
              value={newItem.priority}
              onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as RoadmapPriority })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              <option value="high">Hoog</option>
              <option value="medium">Gemiddeld</option>
              <option value="low">Laag</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Huidig niveau</label>
            <select
              value={newItem.currentLevel}
              onChange={(e) => setNewItem({ ...newItem, currentLevel: Number(e.target.value) })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              {maturityLevels.map((l) => (
                <option key={l.level} value={l.level}>{l.level}. {l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Doelniveau</label>
            <select
              value={newItem.targetLevel}
              onChange={(e) => setNewItem({ ...newItem, targetLevel: Number(e.target.value) })}
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
            >
              {maturityLevels.map((l) => (
                <option key={l.level} value={l.level}>{l.level}. {l.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[var(--kweekers-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--kweekers-accent-dark)]"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </form>
  );
}
