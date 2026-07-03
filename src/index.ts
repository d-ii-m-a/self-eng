import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { mistakesRouter } from "./endpoints/mistakes/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMistakesServer } from "./mcp/mistakesServer";
import { bearerAuth } from "./auth";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	schema: {
		info: {
			title: "My Awesome API",
			version: "2.0.0",
			description: "This is the documentation for my awesome API.",
		},
	},
});

// Register Tasks Sub router
openapi.route("/tasks", tasksRouter);

// Register Mistakes Sub router
openapi.route("/mistakes", mistakesRouter);

// Register other endpoints
openapi.post("/dummy/:slug", DummyEndpoint);

// Register the mistakes MCP server (stateless: fresh transport/server per request)
app.use("/mcp", bearerAuth());
app.all("/mcp", async (c) => {
	const transport = new WebStandardStreamableHTTPServerTransport();
	const server = createMistakesServer(c.env);
	await server.connect(transport);

	return transport.handleRequest(c.req.raw);
});

// Export the Hono app
export default app;
