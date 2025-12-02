import { env } from '$env/dynamic/private';
import { leaderboardCache } from '$lib/cache';
import type { Handle } from '@sveltejs/kit';

let initialized = false;

async function initializeCache() {
	if (initialized) return;

	const leaderboardCode = env.AOC_LEADERBOARD_CODE;
	const sessionCookie = env.AOC_SESSION_COOKIE;

	if (!leaderboardCode || !sessionCookie) {
		console.error('[Server] Missing AOC_LEADERBOARD_CODE or AOC_SESSION_COOKIE environment variables');
		return;
	}

	console.log('[Server] Initializing leaderboard cache...');
	await leaderboardCache.initialize(leaderboardCode, sessionCookie);
	console.log('[Server] Cache initialized successfully');
	
	initialized = true;
}

initializeCache();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

