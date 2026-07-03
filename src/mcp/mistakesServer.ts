import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMistakeStats } from "../endpoints/mistakes/stats";

type MistakeRow = {
	id: number;
	created_at: string;
	original: string;
	correction: string;
	explanation: string;
	pattern: string;
	subpattern: string | null;
	context: string | null;
};

export function createMistakesServer(env: Env): McpServer {
	const server = new McpServer({
		name: "english-mistakes",
		version: "1.0.0",
	});

	server.registerTool(
		"create_mistake",
		{
			title: "Log an English mistake",
			description:
				"Records an English mistake made by the user, along with its correction and an explanation of the underlying grammar/vocabulary pattern.",
			inputSchema: {
				original: z.string().describe("The incorrect sentence or phrase as originally written/said"),
				correction: z.string().describe("The corrected version"),
				explanation: z.string().describe("Why it was wrong and what rule applies"),
				pattern: z.string().describe("Broad category of the mistake, e.g. articles, verb_patterns, prepositions"),
				subpattern: z.string().optional().describe("Optional narrower classification within the pattern"),
				context: z.string().optional().describe("Optional surrounding context or source sentence"),
			},
		},
		async ({ original, correction, explanation, pattern, subpattern, context }) => {
			const row = await env.DB.prepare(
				`INSERT INTO english_mistakes (original, correction, explanation, pattern, subpattern, context)
				 VALUES (?, ?, ?, ?, ?, ?)
				 RETURNING *`,
			)
				.bind(original, correction, explanation, pattern, subpattern ?? null, context ?? null)
				.first<MistakeRow>();

			return {
				content: [{ type: "text", text: JSON.stringify(row) }],
			};
		},
	);

	server.registerTool(
		"list_mistakes",
		{
			title: "List logged English mistakes",
			description: "Returns recently logged English mistakes, optionally filtered by pattern or free-text search.",
			inputSchema: {
				pattern: z.string().optional().describe("Only return mistakes with this exact pattern"),
				search: z.string().optional().describe("Free-text search across original/correction/explanation"),
				limit: z.number().int().min(1).max(100).optional().describe("Max rows to return, default 20"),
			},
		},
		async ({ pattern, search, limit }) => {
			const rows = await env.DB.prepare(
				`SELECT id, created_at, original, correction, explanation, pattern, subpattern, context
				 FROM english_mistakes
				 WHERE (?1 IS NULL OR pattern = ?1)
				   AND (?2 IS NULL OR original LIKE '%' || ?2 || '%' OR correction LIKE '%' || ?2 || '%' OR explanation LIKE '%' || ?2 || '%')
				 ORDER BY created_at DESC
				 LIMIT ?3`,
			)
				.bind(pattern ?? null, search ?? null, limit ?? 20)
				.all<MistakeRow>();

			return {
				content: [{ type: "text", text: JSON.stringify(rows.results) }],
			};
		},
	);

	server.registerTool(
		"get_mistake_stats",
		{
			title: "Get English mistake statistics",
			description:
				"Returns aggregate statistics: total mistakes logged, a breakdown by pattern, and a 12-week trend by pattern.",
			inputSchema: {},
		},
		async () => {
			const stats = await getMistakeStats(env.DB);

			return {
				content: [{ type: "text", text: JSON.stringify(stats) }],
			};
		},
	);

	return server;
}
