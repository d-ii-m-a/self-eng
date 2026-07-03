import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

const patternStats = z.object({
	pattern: z.string(),
	count: z.number().int(),
	last_seen: z.string(),
});

const weeklyStats = z.object({
	week: z.string(),
	pattern: z.string(),
	count: z.number().int(),
});

export class MistakeStats extends OpenAPIRoute {
	public schema = {
		tags: ["Mistakes"],
		summary: "Get aggregate statistics about logged English mistakes",
		responses: {
			"200": {
				description: "Returns total mistakes, a breakdown by pattern, and a 12-week trend by pattern",
				...contentJson({
					success: Boolean,
					result: z.object({
						total: z.number().int(),
						by_pattern: z.array(patternStats),
						weekly: z.array(weeklyStats),
					}),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const db = c.env.DB;

		const totalRow = await db
			.prepare("SELECT COUNT(*) as count FROM english_mistakes")
			.first<{ count: number }>();

		const byPattern = await db
			.prepare(
				`SELECT pattern, COUNT(*) as count, MAX(created_at) as last_seen
				 FROM english_mistakes
				 GROUP BY pattern
				 ORDER BY count DESC`,
			)
			.all<{ pattern: string; count: number; last_seen: string }>();

		const weekly = await db
			.prepare(
				`SELECT strftime('%Y-W%W', created_at) as week, pattern, COUNT(*) as count
				 FROM english_mistakes
				 WHERE created_at >= datetime('now', '-84 days')
				 GROUP BY week, pattern
				 ORDER BY week DESC, count DESC`,
			)
			.all<{ week: string; pattern: string; count: number }>();

		return {
			success: true,
			result: {
				total: totalRow?.count ?? 0,
				by_pattern: byPattern.results,
				weekly: weekly.results,
			},
		};
	}
}
