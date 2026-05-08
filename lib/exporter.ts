import type { AllocationResult, PartAllocation } from "./solver/types";

// ── Formatting helpers ──────────────────────────────────────────────────────────

function formatKg(value: number): string {
	const rounded = Math.round(value * 1000) / 1000;
	return `${rounded} kg`;
}

function formatDelta(delta: number): string {
	const rounded = Math.round(delta * 1000) / 1000;
	return rounded >= 0 ? `+${rounded} kg` : `${rounded} kg`;
}

function formatComposition(breakdown: Map<number, number>): string {
	return Array.from(breakdown.entries())
		.sort(([a], [b]) => b - a)
		.map(([weight, count]) => `${count}x${weight}kg`)
		.join(", ");
}

function formatProportionPercent(weight: number, total: number): string {
	const pct = (weight / total) * 100;
	return `${Math.round(pct * 10) / 10}%`;
}

// ── CSV ────────────────────────────────────────────────────────────────────────

function buildCsvContent(result: AllocationResult): string {
	const lines: string[] = [];

	// Header metadata
	lines.push(`# Totale peso,${formatKg(result.totalWeightKg)}`);
	lines.push(`# Pacchi in ingresso,${result.totalInputPackageCount}`);
	lines.push(`# Pacchi distribuiti,${result.totalAssignedPackageCount}`);
	lines.push(
		`# Errore assoluto totale,${formatKg(result.totalAbsoluteErrorKg)}`
	);
	lines.push(`# Strategia,${result.strategyUsed}`);
	lines.push("");

	// Column headers
	lines.push(
		"Alias,Proporzione,Target (kg),Assegnato (kg),Delta (kg),N. Pacchi,Composizione"
	);

	const totalProp = result.parts.reduce(
		(s, p) => s + p.proportionWeight,
		0
	);

	for (const part of result.parts) {
		const delta = part.assignedWeightKg - part.targetWeightKg;
		const composition = formatComposition(part.breakdownBySize);
		const propPct = formatProportionPercent(
			part.proportionWeight,
			totalProp
		);
		const target = Math.round(part.targetWeightKg * 1000) / 1000;
		const assigned = Math.round(part.assignedWeightKg * 1000) / 1000;
		const deltaVal = Math.round(delta * 1000) / 1000;

		lines.push(
			`${part.alias},${propPct},${target},${assigned},${deltaVal >= 0 ? "+" : ""}${deltaVal},${part.packageCount},${composition}`
		);
	}

	return lines.join("\n");
}

// ── TXT ────────────────────────────────────────────────────────────────────────

function buildTxtContent(result: AllocationResult): string {
	const SEP =
		"------------------------------------------------------------------------";
	const lines: string[] = [];

	lines.push("Risultato allocazione");
	lines.push(SEP);
	lines.push(`Peso totale: ${formatKg(result.totalWeightKg)}`);
	lines.push(
		`Controllo pacchi: ✓  ${result.totalInputPackageCount} in ingresso → ${result.totalAssignedPackageCount} distribuiti`
	);
	lines.push(
		`Errore assoluto totale (kg): ${formatKg(result.totalAbsoluteErrorKg)}`
	);
	lines.push(`Strategia: ${result.strategyUsed}`);
	lines.push("");

	for (const part of result.parts) {
		const delta = part.assignedWeightKg - part.targetWeightKg;
		const target = Math.round(part.targetWeightKg * 1000) / 1000;
		const assigned = Math.round(part.assignedWeightKg * 1000) / 1000;
		const composition = formatComposition(part.breakdownBySize);

		lines.push(
			`[${part.alias}]  Target: ${target} kg  |  Assegnato: ${assigned} kg  |  Delta: ${formatDelta(delta)}  |  Pacchi: ${part.packageCount}`
		);
		lines.push(`  Composizione: ${composition}`);
	}

	return lines.join("\n");
}

// ── Download trigger ───────────────────────────────────────────────────────────

function downloadBlob(
	content: string,
	filename: string,
	mimeType: string
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

function timestampedFilename(ext: string): string {
	const now = new Date();
	const pad = (n: number): string => String(n).padStart(2, "0");
	const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
	return `fetta-${ts}.${ext}`;
}

export function exportCsv(result: AllocationResult): void {
	const content = buildCsvContent(result);
	downloadBlob(
		content,
		timestampedFilename("csv"),
		"text/csv;charset=utf-8;"
	);
}

export function exportTxt(result: AllocationResult): void {
	const content = buildTxtContent(result);
	downloadBlob(
		content,
		timestampedFilename("txt"),
		"text/plain;charset=utf-8;"
	);
}
