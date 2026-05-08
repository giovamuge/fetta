import type {
	AllocationResult,
	NamedProportion,
	PackageType,
	PartAllocation,
} from "./types";

// ── Threshold ──────────────────────────────────────────────────────────────────
// Keep DFS nodes under ~500 000: maxItems = floor(log(500000) / log(partCount))
function exactMaxItems(partCount: number): number {
	if (partCount <= 1) return 64;
	return Math.floor(Math.log(500_000) / Math.log(partCount));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function expandItems(packageTypes: PackageType[]): number[] {
	const items: number[] = [];
	for (const pkg of packageTypes) {
		for (let i = 0; i < pkg.availableCount; i++) {
			items.push(pkg.weightKg);
		}
	}
	items.sort((a, b) => b - a);
	return items;
}

function computeAbsoluteError(sums: number[], targets: number[]): number {
	let total = 0;
	for (let i = 0; i < sums.length; i++) {
		total += Math.abs(sums[i] - targets[i]);
	}
	return Math.round(total * 1_000_000) / 1_000_000;
}

// ── Exact DFS ──────────────────────────────────────────────────────────────────

function solveExact(items: readonly number[], targets: number[]): number[] {
	const n = items.length;
	const p = targets.length;
	const partSums = new Array<number>(p).fill(0);
	const currentAssignment = new Array<number>(n).fill(0);
	const bestAssignment = new Array<number>(n).fill(0);
	let bestError = Number.MAX_VALUE;

	function dfs(index: number): void {
		if (index === n) {
			const err = computeAbsoluteError(partSums, targets);
			if (err < bestError) {
				bestError = err;
				for (let k = 0; k < n; k++) {
					bestAssignment[k] = currentAssignment[k];
				}
			}
			return;
		}

		const weight = items[index];
		let lastSum: number | null = null;
		let lastTarget: number | null = null;

		for (let part = 0; part < p; part++) {
			const s = partSums[part];
			const t = targets[part];
			// Symmetry-breaking: skip if two parts have identical sum and target
			if (lastSum !== null && s === lastSum && t === lastTarget) {
				continue;
			}
			lastSum = s;
			lastTarget = t;

			partSums[part] += weight;
			currentAssignment[index] = part;
			dfs(index + 1);
			partSums[part] -= weight;
		}
	}

	dfs(0);
	return bestAssignment;
}

// ── Greedy + iterative local improvement ───────────────────────────────────────

function solveGreedyWithSwaps(
	items: readonly number[],
	targets: number[]
): number[] {
	const n = items.length;
	const p = targets.length;
	const assignment = new Array<number>(n).fill(0);
	const partSums = new Array<number>(p).fill(0);

	// Greedy: assign each item to the part with the largest remaining gap
	for (let i = 0; i < n; i++) {
		let bestPart = 0;
		let bestGap = -Infinity;
		for (let part = 0; part < p; part++) {
			const gap = targets[part] - partSums[part];
			if (gap > bestGap) {
				bestGap = gap;
				bestPart = part;
			}
		}
		assignment[i] = bestPart;
		partSums[bestPart] += items[i];
	}

	// Iterative improvement: 2-opt swaps + single-item moves
	let improved = true;
	while (improved) {
		improved = false;
		const currentError = computeAbsoluteError(partSums, targets);

		// 2-opt swaps
		outerSwap: for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				const pi = assignment[i];
				const pj = assignment[j];
				if (pi === pj) continue;

				partSums[pi] += items[j] - items[i];
				partSums[pj] += items[i] - items[j];

				if (computeAbsoluteError(partSums, targets) < currentError) {
					const tmp = assignment[i];
					assignment[i] = assignment[j];
					assignment[j] = tmp;
					improved = true;
					break outerSwap;
				} else {
					partSums[pi] += items[i] - items[j];
					partSums[pj] += items[j] - items[i];
				}
			}
		}

		if (improved) continue;

		// Single-item moves
		outerMove: for (let i = 0; i < n; i++) {
			const pi = assignment[i];
			for (let part = 0; part < p; part++) {
				if (part === pi) continue;

				partSums[pi] -= items[i];
				partSums[part] += items[i];

				if (computeAbsoluteError(partSums, targets) < currentError) {
					assignment[i] = part;
					improved = true;
					break outerMove;
				} else {
					partSums[pi] += items[i];
					partSums[part] -= items[i];
				}
			}
		}
	}

	return assignment;
}

// ── Result construction ────────────────────────────────────────────────────────

function buildResult(
	partAssignment: number[],
	items: number[],
	packageTypes: PackageType[],
	proportions: NamedProportion[],
	targets: number[],
	totalWeight: number,
	totalPackageCount: number,
	strategy: string
): AllocationResult {
	const p = proportions.length;
	const partSums = new Array<number>(p).fill(0);
	const breakdowns: Map<number, number>[] = Array.from(
		{ length: p },
		() => new Map()
	);

	for (let i = 0; i < items.length; i++) {
		const part = partAssignment[i];
		partSums[part] += items[i];
		const prev = breakdowns[part].get(items[i]) ?? 0;
		breakdowns[part].set(items[i], prev + 1);
	}

	const parts: PartAllocation[] = proportions.map((prop, part) => ({
		partIndex: part + 1,
		alias: prop.alias,
		proportionWeight: prop.weight,
		targetWeightKg: targets[part],
		assignedWeightKg: partSums[part],
		breakdownBySize: breakdowns[part],
		packageCount: Array.from(breakdowns[part].values()).reduce(
			(a, b) => a + b,
			0
		),
	}));

	const totalAbsoluteErrorKg = computeAbsoluteError(partSums, targets);

	return {
		parts,
		totalWeightKg: totalWeight,
		totalInputPackageCount: totalPackageCount,
		totalAbsoluteErrorKg,
		strategyUsed: strategy,
		totalAssignedPackageCount: parts.reduce(
			(a, p) => a + p.packageCount,
			0
		),
	};
}

// ── Public entry point ─────────────────────────────────────────────────────────

export function solve(
	packageTypes: PackageType[],
	proportions: NamedProportion[]
): AllocationResult {
	if (packageTypes.length === 0) {
		throw new Error("È richiesto almeno un tipo di pacco.");
	}
	if (proportions.length === 0) {
		throw new Error("È richiesta almeno una proporzione.");
	}

	const normalizedPackages = [...packageTypes].sort(
		(a, b) => b.weightKg - a.weightKg
	);
	const totalPackageCount = normalizedPackages.reduce(
		(s, p) => s + p.availableCount,
		0
	);
	const totalWeight = normalizedPackages.reduce(
		(s, p) => s + p.weightKg * p.availableCount,
		0
	);

	const totalProportion = proportions.reduce((s, p) => s + p.weight, 0);
	const targets = proportions.map(
		(p) => totalWeight * (p.weight / totalProportion)
	);

	const items = expandItems(normalizedPackages);
	const partCount = proportions.length;
	const threshold = exactMaxItems(partCount);

	let partAssignment: number[];
	let strategy: string;

	if (items.length <= threshold) {
		partAssignment = solveExact(items, targets);
		strategy = "exact";
	} else {
		partAssignment = solveGreedyWithSwaps(items, targets);
		strategy = "greedy+swaps";
	}

	if (partAssignment.length !== items.length) {
		throw new Error("Errore interno: conteggio item non corrispondente.");
	}

	return buildResult(
		partAssignment,
		items,
		normalizedPackages,
		proportions,
		targets,
		totalWeight,
		totalPackageCount,
		strategy
	);
}
