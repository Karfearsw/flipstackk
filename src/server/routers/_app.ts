import { router } from "@/lib/trpc";
import { authRouter } from "./auth";
import { leadsRouter } from "./leads";
import { buyersRouter } from "./buyers";
import { tasksRouter } from "./tasks";
import { offersRouter } from "./offers";
import { analyticsRouter } from "./analytics";
import { healthRouter } from "./health";

export const appRouter = router({
  auth: authRouter,
  leads: leadsRouter,
  buyers: buyersRouter,
  tasks: tasksRouter,
  offers: offersRouter,
  analytics: analyticsRouter,
  health: healthRouter,
});

export type AppRouter = typeof appRouter;