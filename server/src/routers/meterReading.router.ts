import { z } from "zod";
import { MeterReading } from "../models/meterReading.entity.js";
import { publicProcedure, router } from "../trpc.js";

export const meterReadingRouter = router({
  listMeterReadings: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { limit = 10, offset = 0 } = input;

      const [items, total] = await ctx.em.findAndCount(
        MeterReading,
        {},
        {
          limit,
          offset,
        }
      );

      return { items, total };
    }),
  insertSQLMeterReadingStatement: publicProcedure
    .input(z.string())
    .mutation(
      async ({ input, ctx }): Promise<{ changes: number; lastID: number }> => {
        const connection = ctx.em.getConnection();
        return connection.execute(input).catch((error) => {
          console.error("Error executing SQL statement:", error);
          throw new Error(
            `Error executing SQL statement: ${error.code || "Unknown error"}`
          );
        });
      }
    ),
});
