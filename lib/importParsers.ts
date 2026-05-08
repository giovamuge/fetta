export interface ParseError {
	line: number;
	message: string;
}

export interface ParseResult<T> {
	data: T[];
	errors: ParseError[];
}

/**
 * Detect the delimiter used in a line.
 * Priority: comma → semicolon → tab → whitespace.
 */
function splitLine(line: string): string[] {
	if (line.includes(",")) return line.split(",").map((s) => s.trim());
	if (line.includes(";")) return line.split(";").map((s) => s.trim());
	if (line.includes("\t")) return line.split("\t").map((s) => s.trim());
	return line.trim().split(/\s+/);
}

const PACKAGE_WEIGHT_HEADERS = new Set([
	"peso",
	"weight",
	"peso_kg",
	"weight_kg",
	"kg",
	"pesi",
]);
const PACKAGE_QTY_HEADERS = new Set([
	"quantita",
	"quantità",
	"quantity",
	"qty",
	"n",
	"num",
	"count",
]);
const ALIAS_HEADERS = new Set([
	"alias",
	"nome",
	"name",
	"partecipante",
	"participant",
]);
const PROPORTION_HEADERS = new Set([
	"peso",
	"weight",
	"proporzione",
	"proportion",
	"quota",
	"share",
]);

function stripNonAlpha(s: string): string {
	return s.toLowerCase().replace(/[^a-z]/g, "");
}

function isHeaderLine(
	parts: string[],
	col0Set: Set<string>,
	col1Set: Set<string>,
): boolean {
	if (parts.length < 2) return false;
	const p0 = stripNonAlpha(parts[0]);
	const p1 = stripNonAlpha(parts[1]);
	return col0Set.has(p0) || col1Set.has(p1);
}

/**
 * Parse packages from a CSV or TXT string.
 *
 * Expected format (header optional):
 *   peso_kg,quantita
 *   5,2
 *   6,3
 *
 * TXT (whitespace-separated):
 *   5 2
 *   6 3
 *
 * Lines starting with # are ignored as comments.
 */
export function parsePackages(
	content: string,
): ParseResult<{ weightKg: number; availableCount: number }> {
	const lines = content.split(/\r?\n/);
	const data: { weightKg: number; availableCount: number }[] = [];
	const errors: ParseError[] = [];

	let skipNext = false;
	const firstNonEmpty = lines.find(
		(l) => l.trim() && !l.trim().startsWith("#"),
	);
	if (firstNonEmpty) {
		const parts = splitLine(firstNonEmpty);
		if (
			isHeaderLine(parts, PACKAGE_WEIGHT_HEADERS, PACKAGE_QTY_HEADERS)
		) {
			skipNext = true;
		}
	}

	let lineNum = 0;
	let headerSkipped = false;

	for (const raw of lines) {
		lineNum++;
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		if (skipNext && !headerSkipped) {
			headerSkipped = true;
			continue;
		}

		const parts = splitLine(line);
		if (parts.length < 2) {
			errors.push({
				line: lineNum,
				message: `Attesi 2 valori (peso, quantità)`,
			});
			continue;
		}

		const w = parseFloat(parts[0]);
		const q = parseInt(parts[1], 10);

		if (isNaN(w) || w <= 0) {
			errors.push({
				line: lineNum,
				message: `Peso non valido: "${parts[0]}"`,
			});
			continue;
		}
		if (isNaN(q) || q < 1) {
			errors.push({
				line: lineNum,
				message: `Quantità non valida: "${parts[1]}"`,
			});
			continue;
		}

		data.push({ weightKg: w, availableCount: q });
	}

	return { data, errors };
}

/**
 * Parse proportions from a CSV or TXT string.
 *
 * Expected format (header optional):
 *   alias,proporzione
 *   Alice,2
 *   Bob,3
 *
 * TXT (whitespace-separated, last token is the number):
 *   Alice 2
 *   Bob 3
 *   Maria Rossi 1.5
 *
 * Lines starting with # are ignored as comments.
 */
export function parseProportions(
	content: string,
): ParseResult<{ alias: string; weight: number }> {
	const lines = content.split(/\r?\n/);
	const data: { alias: string; weight: number }[] = [];
	const errors: ParseError[] = [];

	let skipNext = false;
	const firstNonEmpty = lines.find(
		(l) => l.trim() && !l.trim().startsWith("#"),
	);
	if (firstNonEmpty) {
		const parts = splitLine(firstNonEmpty);
		if (isHeaderLine(parts, ALIAS_HEADERS, PROPORTION_HEADERS)) {
			skipNext = true;
		}
	}

	let lineNum = 0;
	let headerSkipped = false;

	for (const raw of lines) {
		lineNum++;
		const line = raw.trim();
		if (!line || line.startsWith("#")) continue;
		if (skipNext && !headerSkipped) {
			headerSkipped = true;
			continue;
		}

		const parts = splitLine(line);
		if (parts.length < 2) {
			errors.push({
				line: lineNum,
				message: `Attesi almeno 2 valori (alias, proporzione)`,
			});
			continue;
		}

		// Last token is the weight; everything before is the alias
		const weightStr = parts[parts.length - 1];
		const alias = parts.slice(0, parts.length - 1).join(" ").trim();
		const w = parseFloat(weightStr);

		if (!alias) {
			errors.push({ line: lineNum, message: `Alias vuoto` });
			continue;
		}
		if (isNaN(w) || w <= 0) {
			errors.push({
				line: lineNum,
				message: `Proporzione non valida: "${weightStr}"`,
			});
			continue;
		}

		data.push({ alias, weight: w });
	}

	return { data, errors };
}
