type RefreshLog = { userId: string; channelId: string; timestamp: number };

export class Refresh {
	logs: RefreshLog[] = [];
	timesetMs = 3_600_000;
	userLimit = 5;

	addLog(userId: string, channelId: string): void {
		const existing = this.logs.slice(-this.userLimit).find((l) => l.userId === userId);
		if (existing) this.logs.splice(this.logs.indexOf(existing), 1);
		this.logs.push({ userId, channelId, timestamp: Date.now() });
	}

	clearLogs(): void {
		this.logs = [];
	}

	inTimeset(): RefreshLog[] {
		const cutoff = Date.now() - this.timesetMs;
		return this.logs.filter((l) => l.timestamp > cutoff);
	}

	shouldRefresh(): boolean {
		if (this.logs.length < this.userLimit) return false;
		const cutoff = Date.now() - this.timesetMs;
		return this.logs.slice(-this.userLimit).every((l) => l.timestamp > cutoff);
	}
}

export const refreshLogs = new Refresh();
