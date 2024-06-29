import { trpc } from '../lib/trpc';

const appRouter = trpc.router({});

export type AppRouter = typeof appRouter;
