import { publicProcedure, router } from "../trpc.js";

export const healthCheckRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
});
