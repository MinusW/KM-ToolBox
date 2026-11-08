import Papa from "papaparse";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";

const TIPS_CSV = join(import.meta.dir, "..", "..", "data", "tips.csv");
const quote = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;

// Appends "id;userid;name;description;state" and returns the new id
export async function logTip(name: string, description: string, userId: string): Promise<number> {
	const file = Bun.file(TIPS_CSV);
	const text = (await file.exists()) ? await file.text() : "";

	const { data } = Papa.parse<string[]>(text, { delimiter: ";", skipEmptyLines: true });
	const lastId = Number.parseInt(data.at(-1)?.[0] ?? "", 10);
	const id = (Number.isNaN(lastId) ? 0 : lastId) + 1;

	const row = [id, userId, name, description, "submitted"].map(quote).join(";");
	const prefix = text && !text.endsWith("\n") ? "\n" : "";
	await appendFile(TIPS_CSV, `${prefix}${row}\n`);
	return id;
}
