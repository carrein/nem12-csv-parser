import { RequestContext } from "@mikro-orm/core";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { appRouter } from "./appRouter.js";
import { initORM } from "./db.js";
import { createContext } from "./trpc.js";

export async function bootstrap(port = 4000, migrate = true) {
  const db = await initORM();

  if (migrate) {
    await db.orm.migrator.up();
  }

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => createContext(db.em),
    })
  );

  // Register request context hook
  app.use("onRequest", (request, reply, done) => {
    RequestContext.create(db.em, done);
  });

  // Shut down the connection when closing the app
  app.use("onClose", async () => {
    await db.orm.close();
  });

  const server = app.listen(port);

  return server;
}

(async () => {
  await bootstrap(4000);
  console.log("Server is running on http://localhost:4000");
})();
