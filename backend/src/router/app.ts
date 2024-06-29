import { trpc } from '../lib/trpc';
import { userRouter } from './user';

const appRouter = trpc.router({
  user: userRouter,
});

export const createCaller = trpc.createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
