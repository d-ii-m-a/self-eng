export type PatternStats = {
	pattern: string;
	count: number;
	last_seen: string;
};

export type WeeklyStats = {
	week: string;
	pattern: string;
	count: number;
};

export type MistakeStatsResult = {
	total: number;
	by_pattern: PatternStats[];
	weekly: WeeklyStats[];
};

export async function getMistakeStats(db: D1Database): Promise<MistakeStatsResult> {
	const totalRow = await db.prepare("SELECT COUNT(*) as count FROM english_mistakes").first<{ count: number }>();

	const byPattern = await db
		.prepare(
			`SELECT pattern, COUNT(*) as count, MAX(created_at) as last_seen
			 FROM english_mistakes
			 GROUP BY pattern
			 ORDER BY count DESC`,
		)
		.all<PatternStats>();

	const weekly = await db
		.prepare(
			`SELECT strftime('%Y-W%W', created_at) as week, pattern, COUNT(*) as count
			 FROM english_mistakes
			 WHERE created_at >= datetime('now', '-84 days')
			 GROUP BY week, pattern
			 ORDER BY week DESC, count DESC`,
		)
		.all<WeeklyStats>();

	return {
		total: totalRow?.count ?? 0,
		by_pattern: byPattern.results,
		weekly: weekly.results,
	};
}
