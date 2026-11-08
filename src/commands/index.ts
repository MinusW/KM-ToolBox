import type { Command } from "@/types/command";
import * as buildcost from "./buildcost";
import * as clear from "./clear";
import * as contribute from "./contribute";
import * as group from "./group";
import * as noble from "./noble";
import * as serverrefresh from "./serverrefresh";
import * as temple from "./temple";
import * as totd from "./totd";
import * as trait from "./trait";

export const commands: Command[] = [
	buildcost,
	clear,
	contribute,
	group,
	noble,
	serverrefresh,
	temple,
	totd,
	trait,
];
