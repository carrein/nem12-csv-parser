import { createTRPCContext } from "@trpc/tanstack-react-query";
import { AppRouter } from "../../server/src/appRouter";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
