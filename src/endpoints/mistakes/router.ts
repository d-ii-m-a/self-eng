import { Hono } from "hono";
import { fromHono } from "chanfana";
import { MistakeList } from "./mistakeList";
import { MistakeCreate } from "./mistakeCreate";
import { MistakeStats } from "./mistakeStats";

export const mistakesRouter = fromHono(new Hono());

mistakesRouter.get("/", MistakeList);
mistakesRouter.post("/", MistakeCreate);
mistakesRouter.get("/stats", MistakeStats);
