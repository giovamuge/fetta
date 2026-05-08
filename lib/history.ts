import type { AllocationResult, PartAllocation } from "@/lib/solver/types";

const STORAGE_KEY = "fetta:history";
const MAX_ENTRIES = 20;

// ── Serializable types (Map<number,number> → tuple array) ────────────────────

interface SerializedPartAllocation extends Omit<
	PartAllocation,
	"breakdownBySize"
> {
	breakdownBySize: [number, number][];
}

interface SerializedAllocationResult extends Omit<
	AllocationResult,
	"parts"
> {
	parts: SerializedPartAllocation[];
}

export interface HistoryEntry {
	id: string;
	createdAt: number;
	result: SerializedAllocationResult;
	packages: { weightKg: number; availableCount: number }[];
	proportions: { alias: string; weight: number }[];
}

// ── Serialization ─────────────────────────────────────────────────────────────

function serializeResult(
	result: AllocationResult
): SerializedAllocationResult {
	return {
		...result,
		parts: result.parts.map((part) => ({
			...part,
			breakdownBySize: Array.from(part.breakdownBySize.entries()),
		})),
	};
}

export function deserializeResult(
	serialized: SerializedAllocationResult
): AllocationResult {
	return {
		...serialized,
		parts: serialized.parts.map((part) => ({
			...part,
			breakdownBySize: new Map(part.breakdownBySize),
		})),
	};
}

// ── localStorage helpers ──────────────────────────────────────────────────────

export function loadHistory(): HistoryEntry[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as HistoryEntry[];
	} catch {
		return [];
	}
}

export function saveToHistory(
	result: AllocationResult,
	packages: { weightKg: number; availableCount: number }[],
	proportions: { alias: string; weight: number }[]
): HistoryEntry {
	const entry: HistoryEntry = {
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		result: serializeResult(result),
		packages,
		proportions,
	};

	const history = loadHistory();
	const updated = [entry, ...history].slice(0, MAX_ENTRIES);

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch {
		// localStorage quota exceeded or unavailable — silently skip
	}

	return entry;
}

export function removeFromHistory(id: string): HistoryEntry[] {
	const updated = loadHistory().filter((e) => e.id !== id);
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	} catch {
		// ignore
	}
	return updated;
}

export function clearHistory(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
