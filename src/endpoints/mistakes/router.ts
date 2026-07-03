import { Hono } from "hono";
import { fromHono } from "chanfana";
import { MistakeList } from "./mistakeList";
import { MistakeCreate } from "./mistakeCreate";
import { MistakeStats } from "./mistakeStats";
import { bearerAuth } from "../../auth";

export const mistakesRouter = fromHono(new Hono<{ Bindings: Env }>());

mistakesRouter.use("*", bearerAuth());

mistakesRouter.get("/", MistakeList);
mistakesRouter.post("/", MistakeCreate);
mistakesRouter.get("/stats", MistakeStats);
