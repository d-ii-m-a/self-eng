import { z } from "zod";

export const mistake = z.object({
	id: z.number().int(),
	created_at: z.string(),
	original: z.string(),
	correction: z.string(),
	explanation: z.string(),
	pattern: z.string(),
	subpattern: z.string().nullable().optional(),
	context: z.string().nullable().optional(),
});

export const MistakeModel = {
	tableName: "english_mistakes",
	primaryKeys: ["id"],
	schema: mistake,
};
