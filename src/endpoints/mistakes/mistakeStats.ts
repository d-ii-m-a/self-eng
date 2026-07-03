import { contentJson, OpenAPIRoute } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { getMistakeStats } from "./stats";

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
		const result = await getMistakeStats(c.env.DB);

		return {
			success: true,
			result,
		};
	}
}
