"use client";

import { useCallback, useState } from "react";
import {
	clearHistory,
	loadHistory,
	removeFromHistory,
	saveToHistory,
	type HistoryEntry,
} from "@/lib/history";
import type { AllocationResult } from "@/lib/solver/types";

export function useHistory() {
	const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

	const save = useCallback(
		(
			result: AllocationResult,
			packages: { weightKg: number; availableCount: number }[],
			proportions: { alias: string; weight: number }[],
			name?: string
		) => {
			saveToHistory(result, packages, proportions, name);
			setEntries(loadHistory());
		},
		[]
	);

	const remove = useCallback((id: string) => {
		setEntries(removeFromHistory(id));
	}, []);

	const clear = useCallback(() => {
		clearHistory();
		setEntries([]);
	}, []);

	return { entries, save, remove, clear };
}
