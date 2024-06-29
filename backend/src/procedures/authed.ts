import { TRPCError } from '@trpc/server';
import { trpc } from '../lib/trpc';

export const authedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
