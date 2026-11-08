export type TempleCost = { bricks: number; blocks: number; slabs: number };

export function templeCost(startLevel = 0, endLevel = 50): TempleCost {
	const end = Math.min(endLevel, 50);
	let start = Math.max(startLevel, 0);
	if (start >= end) start = end - 1;

	const cost = { bricks: 0, blocks: 0, slabs: 0 };
	for (let x = start + 1; x <= end; x++) {
		cost.bricks += x * 2 + 10;
		if (x > 14) cost.blocks += (x - 14) * 2 + 10;
		if (x > 29) cost.slabs += (x - 29) * 2;
	}
	return cost;
}
