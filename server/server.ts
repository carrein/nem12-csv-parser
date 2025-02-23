import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

import { createContext } from "./src/context";
import { appRouter } from "./src/router";

const app = express();

app.use(cors());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(4000);

export type AppRouter = typeof appRouter;
