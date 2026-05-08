import type { NamedProportion, PackageType } from "./types";

/**
 * Parses package catalog string.
 * Format: "peso1:quantità1,peso2:quantità2,..."
 * Examples: "5:2,6:3" → 2 packs of 5 kg and 3 packs of 6 kg
 */
export function parsePackages(rawInput: string): PackageType[] {
	const trimmed = rawInput.trim();
	if (!trimmed) {
		throw new Error("Il catalogo pacchi non può essere vuoto.");
	}

	const chunks = trimmed.split(",").map((c) => c.trim()).filter(Boolean);
	const result: PackageType[] = [];

	for (const chunk of chunks) {
		const pair = chunk.split(":").map((s) => s.trim());
		if (pair.length !== 2) {
			throw new Error(
				`Voce non valida "${chunk}". Formato atteso: peso:quantità`
			);
		}

		const weightKg = parseFloat(pair[0]);
		if (isNaN(weightKg) || weightKg <= 0) {
			throw new Error(`Peso non valido "${pair[0]}".`);
		}

		const count = parseInt(pair[1], 10);
		if (isNaN(count) || count < 0) {
			throw new Error(`Quantità non valida "${pair[1]}".`);
		}

		if (count === 0) continue;

		result.push({ weightKg, availableCount: count });
	}

	if (result.length === 0) {
		throw new Error("Il catalogo pacchi non contiene pacchi disponibili.");
	}

	return result;
}

/**
 * Parses proportions string.
 * Supported formats:
 *   With aliases:  "Alice=2,Bob=3,Carlo=5"  or  "Alice=2:Bob=3:Carlo=5"
 *   Without:       "2:3:5"  or  "2,3,5"  or  "20%,30%,50%"
 *   (auto-names:   "Parte 1", "Parte 2", …)
 */
export function parseProportions(rawInput: string): NamedProportion[] {
	const trimmed = rawInput.trim();
	if (!trimmed) {
		throw new Error("Le proporzioni non possono essere vuote.");
	}

	// Determine separator: ':' if used without '=' signs, ',' otherwise
	let separator: string;
	if (trimmed.includes(":") && !trimmed.includes("=")) {
		separator = ":";
	} else if (trimmed.includes(":") && trimmed.includes("=")) {
		separator = ":";
	} else {
		separator = ",";
	}

	const tokens = trimmed
		.split(separator)
		.map((t) => t.trim())
		.filter(Boolean);

	if (tokens.length === 0) {
		throw new Error("Nessuna proporzione trovata.");
	}

	const values: NamedProportion[] = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		let alias: string;
		let rawValue: string;

		const eqIndex = token.indexOf("=");
		if (eqIndex > 0) {
			alias = token.slice(0, eqIndex).trim();
			rawValue = token.slice(eqIndex + 1).trim();
		} else {
			alias = `Parte ${i + 1}`;
			rawValue = token.trim();
		}

		const cleaned = rawValue.replace(/%$/, "");
		const value = parseFloat(cleaned);
		if (isNaN(value)) {
			throw new Error(`Valore proporzione non valido: "${token}".`);
		}
		if (value <= 0) {
			throw new Error("Tutte le proporzioni devono essere maggiori di zero.");
		}

		values.push({ alias, weight: value });
	}

	return values;
}
