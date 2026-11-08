const UNITS = [
	[1e3, "k"],
	[1e6, "m"],
	[1e9, "b"],
] as const;

export const color = {
	primary: "#F7931E",
} as const;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// 1234567 -> 1'234'567
export const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// 12.50 -> "12.5", 10 -> "10" (replaces the Ruby .gsub('.0', ''))
export const trimNumber = (n: number) => String(Number(n.toFixed(2)));

// in src/utils/format.ts
export const codeBlock = (text: string) => "```" + text + "```";

// 2305000 -> "2.30m", 2306000 -> "2.31m", 231521 -> "231.52k"
export function compact(n: number): string {
	const sign = n < 0 ? "-" : "";
	const abs = Math.abs(n);

	// Largest unit that fits (-1 means under 1000)
	let i = -1;
	while (i + 1 < UNITS.length && abs >= UNITS[i + 1]![0]) i++;
	if (i < 0) return sign + String(abs);

	// Hundredths of the unit, rounding exact ties down (x.xx5 -> x.xx)
	const hundredths = (index: number) => Math.ceil(abs / (UNITS[index]![0] / 100) - 0.5);

	let h = hundredths(i);
	// 999,999 rounds to 1000.00k, so roll over to 1.00m instead
	if (h >= 100_000 && i + 1 < UNITS.length) {
		i++;
		h = hundredths(i);
	}

	return `${sign}${(h / 100).toFixed(2)}${UNITS[i]![1]}`;
}
