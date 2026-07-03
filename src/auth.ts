import { MiddlewareHandler } from "hono";

function timingSafeEqual(a: string, b: string): boolean {
	const enc = new TextEncoder();
	const aBytes = enc.encode(a);
	const bBytes = enc.encode(b);

	if (aBytes.length !== bBytes.length) {
		return false;
	}

	let diff = 0;
	for (let i = 0; i < aBytes.length; i++) {
		diff |= aBytes[i] ^ bBytes[i];
	}

	return diff === 0;
}

export function bearerAuth(): MiddlewareHandler<{ Bindings: Env }> {
	return async (c, next) => {
		const header = c.req.header("Authorization") ?? "";
		const expected = `Bearer ${c.env.MCP_TOKEN}`;
		const authorized = c.env.MCP_TOKEN !== undefined && c.env.MCP_TOKEN.length > 0 && timingSafeEqual(header, expected);

		if (!authorized) {
			return c.json({ success: false, errors: [{ code: 401, message: "Unauthorized" }] }, 401);
		}

		await next();
	};
}
