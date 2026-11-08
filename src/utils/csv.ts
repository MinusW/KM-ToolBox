import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export async function readCsv(path: string): Promise<CsvRow[]> {
	const text = await Bun.file(path).text();
	const { data, errors } = Papa.parse<CsvRow>(text, {
		header: true,
		delimiter: ";",
		skipEmptyLines: true,
	});
	// Ruby's CSV tolerates short rows, so only fail on real parse errors
	const [firstError] = errors.filter((e) => e.type !== "FieldMismatch");
	if (firstError) throw new Error(`${path}: ${firstError.message}`);
	return data;
}

// Returns a required column, or throws if the CSV doesn't have it
export function col(row: CsvRow, name: string): string {
	const value = row[name];
	if (value === undefined) throw new Error(`CSV is missing column "${name}"`);
	return value;
}

// Mirror Ruby's to_i / to_f: blank or invalid becomes 0
export const toInt = (v: string | undefined) => Number.parseInt(v ?? "", 10) || 0;
export const toFloat = (v: string | undefined) => Number.parseFloat(v ?? "") || 0;
