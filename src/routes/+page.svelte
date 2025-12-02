<script lang="ts">
	import type { Member } from '$lib/types';

	let { data } = $props();

	let members: Member[] | null = $state(
		data.leaderboardData ? processMemberData(data.leaderboardData.members) : null
	);
	let error = $state(data.error || null);
	let cacheAge = $state(data.cacheAge || 0);

	/**
	 * Process member data: convert to array, sort, and add ranks
	 */
	function processMemberData(membersObject: Record<string, Member>): Member[] {
		const membersArray = Object.values(membersObject);
		membersArray.sort((a, b) => b.local_score - a.local_score);
		return membersArray;
	}

	/**
	 * Format Unix timestamp to readable date/time string
	 */
	function formatTimestamp(timestamp: number): string {
		if (timestamp === 0) return '-';
		const date = new Date(timestamp * 1000);
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Get list of completed days from completion_day_level
	 */
	function getCompletedDays(completionDayLevel: Record<string, Record<string, any>>): string {
		const days = Object.keys(completionDayLevel).sort((a, b) => parseInt(a) - parseInt(b));
		if (days.length === 0) return '-';
		return days.join(', ');
	}

	/**
	 * Check if member has completed both stars for today
	 */
	function hasCompletedBothStarsToday(member: any): boolean {
		const today = new Date();
		const currentDay = today.getDate();
		const currentMonth = today.getMonth() + 1;
		
		if (currentMonth !== 12) return false;
		
		const dayData = member.completion_day_level[currentDay.toString()];
		if (!dayData) return false;
		
		return dayData['1'] && dayData['2'];
	}

	/**
	 * Get star SVG based on completion status
	 */
	function getStarColor(hasGold: boolean, hasSilver: boolean): string {
		if (hasGold) return '#FFD700';
		if (hasSilver) return '#9CA3AF';
		return '#E5E7EB';
	}
</script>

	<div class="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
	<div class="max-w-6xl mx-auto">
		<header class="text-center mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
				Hack Club Advent of Code Leaderboard
			</h1>
			<p class="text-lg sm:text-xl text-gray-600">2025</p>
			{#if members && cacheAge > 0}
				<p class="text-sm text-gray-500 mt-2">
					Last updated: {Math.floor(cacheAge / 60)} minute{Math.floor(cacheAge / 60) !== 1 ? 's' : ''} ago
				</p>
			{/if}
		</header>

		{#if error}
			<div class="bg-red-50 border-2 border-red-300 rounded-lg p-8 max-w-2xl mx-auto">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div class="ml-4 flex-1">
						<h2 class="text-xl font-bold text-red-900 mb-3">
							{#if error.type === 'auth'}
								Authentication Error
							{:else if error.type === 'config'}
								Configuration Error
							{:else}
								Network Error
							{/if}
						</h2>
						<p class="text-red-800 mb-4 leading-relaxed">
							{error.message}
						</p>
						
						{#if error.type === 'auth' || error.type === 'config'}
							<div class="bg-white border border-red-200 rounded-lg p-4 mt-4">
								<p class="text-sm font-semibold text-gray-700 mb-2">Required Environment Variables:</p>
								<ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
									<li><code class="bg-gray-100 px-2 py-0.5 rounded">AOC_LEADERBOARD_CODE</code> - Your private leaderboard ID</li>
									<li><code class="bg-gray-100 px-2 py-0.5 rounded">AOC_SESSION_COOKIE</code> - Your Advent of Code session cookie</li>
								</ul>
								<p class="text-sm text-gray-700 mt-3">
									Please set these variables in your <code class="bg-gray-100 px-2 py-0.5 rounded">.env</code> file and restart the server.
								</p>
							</div>
						{:else if error.type === 'network'}
							<div class="bg-white border border-red-200 rounded-lg p-4 mt-4">
								<p class="text-sm font-semibold text-gray-700 mb-2">Troubleshooting Steps:</p>
								<ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
									<li>Wait a moment and refresh the page</li>
									<li>Check your internet connection</li>
									<li>Verify the Advent of Code website is accessible</li>
									<li>Check server logs for more details</li>
								</ul>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else if members}
			<div class="bg-white rounded-lg shadow-lg overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full" role="table" aria-label="Advent of Code Leaderboard">
						<thead class="bg-gray-100 border-b border-gray-200">
							<tr>
								<th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Rank
								</th>
								<th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Name
								</th>
								<th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Stars
								</th>
								<th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Score
								</th>
								<th scope="col" class="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Last Star
								</th>
								<th scope="col" class="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
									Completed Days
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							{#each members as member, index}
								{@const rank = index + 1}
								{@const isTop3 = rank <= 3}
								{@const isFirst = rank === 1}
								{@const isSecond = rank === 2}
								{@const isThird = rank === 3}
								{@const hasGoldStar = hasCompletedBothStarsToday(member)}
								{@const hasSilverStar = member.stars > 0 && !hasGoldStar}
								{@const starColor = getStarColor(hasGoldStar, hasSilverStar)}
								
								<!-- Determine row background color with top 3 styling -->
								{@const bgColor = isFirst ? 'bg-yellow-100' : isSecond ? 'bg-gray-200' : isThird ? 'bg-orange-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
								{@const hoverColor = isTop3 ? 'hover:bg-blue-100' : 'hover:bg-blue-50'}
								{@const rankColor = isFirst ? 'text-yellow-700 font-bold text-lg' : isSecond ? 'text-gray-700 font-bold text-lg' : isThird ? 'text-orange-700 font-bold text-lg' : 'text-gray-900'}
								{@const nameColor = isTop3 ? 'text-gray-900 font-bold' : 'text-gray-700'}
								
								<tr class="{bgColor} {hoverColor} transition-colors duration-150">
									<td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
										<span class="{rankColor}">
											{#if isFirst}
												 {rank}
											{:else if isSecond}
												 {rank}
											{:else if isThird}
												 {rank}
											{:else}
												{rank}
											{/if}
										</span>
									</td>
									<td class="px-3 sm:px-6 py-3 sm:py-4 {nameColor}">
										{member.name || `Anonymous User #${member.id}`}
									</td>
									<td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
										<span class="inline-flex items-center gap-1">
											<svg width="20" height="20" viewBox="0 0 24 24" fill="{starColor}" stroke="{starColor}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
												<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
											</svg>
											<span class="text-gray-900 font-semibold">{member.stars}</span>
										</span>
									</td>
									<td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-900 font-semibold">
										{member.local_score}
									</td>
									<td class="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-600 text-sm">
										{#if member.stars > 0}
											{formatTimestamp(member.last_star_ts)}
										{:else}
											-
										{/if}
									</td>
									<td class="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm">
										{getCompletedDays(member.completion_day_level)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>
