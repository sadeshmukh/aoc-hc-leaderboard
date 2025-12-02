import { env } from '$env/dynamic/private';
import { leaderboardCache } from '$lib/cache';

export async function load() {
	const leaderboardCode = env.AOC_LEADERBOARD_CODE || '';
	const joinCode = env.AOC_JOIN_CODE || '';
	const sessionCookie = env.AOC_SESSION_COOKIE || '';

	if (!leaderboardCode || !sessionCookie) {
		return {
			leaderboardCode,
			joinCode,
			error: {
				type: 'config' as const,
				message: 'AOC_LEADERBOARD_CODE and AOC_SESSION_COOKIE environment variables must be set.'
			}
		};
	}

	const leaderboardData = leaderboardCache.getData();
	const cacheError = leaderboardCache.getError();
	const cacheAge = leaderboardCache.getAge();

	if (cacheError) {
		return {
			leaderboardCode,
			joinCode,
			error: {
				type: 'auth' as const,
				message: `Failed to fetch leaderboard: ${cacheError}`
			}
		};
	}

	if (!leaderboardData) {
		return {
			leaderboardCode,
			joinCode,
			error: {
				type: 'network' as const,
				message: 'Leaderboard data is not available yet. Please refresh the page in a moment.'
			}
		};
	}

	return {
		leaderboardCode,
		joinCode,
		leaderboardData,
		cacheAge: cacheAge > 0 ? Math.floor(cacheAge / 1000) : 0
	};
}
