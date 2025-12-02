import type { LeaderboardResponse } from './types';

interface CacheData {
	data: LeaderboardResponse | null;
	lastFetched: number;
	error: string | null;
}

class LeaderboardCache {
	private cache: CacheData = {
		data: null,
		lastFetched: 0,
		error: null
	};
	private fetchInterval: NodeJS.Timeout | null = null;
	private leaderboardCode: string = '';
	private sessionCookie: string = '';
	private isFetching: boolean = false;

	async initialize(leaderboardCode: string, sessionCookie: string): Promise<void> {
		this.leaderboardCode = leaderboardCode;
		this.sessionCookie = sessionCookie;

		await this.fetchLeaderboard();

		if (this.fetchInterval) {
			clearInterval(this.fetchInterval);
		}

		this.fetchInterval = setInterval(() => {
			this.fetchLeaderboard();
		}, 15 * 60 * 1000);
	}

	private async fetchLeaderboard(): Promise<void> {
		if (this.isFetching) {
			console.log('[Cache] Fetch already in progress, skipping');
			return;
		}

		if (!this.leaderboardCode || !this.sessionCookie) {
			console.error('[Cache] Missing leaderboard code or session cookie');
			this.cache.error = 'Missing configuration';
			return;
		}

		this.isFetching = true;
		const startTime = Date.now();

		try {
			const apiUrl = `https://adventofcode.com/2025/leaderboard/private/view/${this.leaderboardCode}.json`;
			console.log(`[Cache] Fetching leaderboard data from ${apiUrl}`);

			const response = await fetch(apiUrl, {
				headers: {
					'Cookie': `session=${this.sessionCookie}`,
					'User-Agent': 'github.com/sadeshmukh/aoc-hc-leaderboard'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const text = await response.text();

			if (text.includes("You don't have permission")) {
				throw new Error("You don't have permission to view this leaderboard");
			}

			const data = JSON.parse(text) as LeaderboardResponse;
			const fetchTime = Date.now() - startTime;

			this.cache = {
				data,
				lastFetched: Date.now(),
				error: null
			};

			const memberCount = Object.keys(data.members).length;
			console.log(
				`[Cache] Successfully fetched leaderboard (${memberCount} members) in ${fetchTime}ms`
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('[Cache] Failed to fetch leaderboard:', errorMessage);
			this.cache.error = errorMessage;
		} finally {
			this.isFetching = false;
		}
	}

	getData(): LeaderboardResponse | null {
		return this.cache.data;
	}

	getError(): string | null {
		return this.cache.error;
	}

	getLastFetched(): number {
		return this.cache.lastFetched;
	}

	getAge(): number {
		if (this.cache.lastFetched === 0) return -1;
		return Date.now() - this.cache.lastFetched;
	}

	destroy(): void {
		if (this.fetchInterval) {
			clearInterval(this.fetchInterval);
			this.fetchInterval = null;
		}
	}
}

export const leaderboardCache = new LeaderboardCache();

