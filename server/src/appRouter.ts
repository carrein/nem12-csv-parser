import { healthCheckRouter } from "./routers/healthCheck.router.js";
import { meterReadingRouter } from "./routers/meterReading.router.js";
import { router } from "./trpc.js";

export const appRouter = router({
  healthCheckRouter,
  meterReadingRouter,
});

export type AppRouter = typeof appRouter;
