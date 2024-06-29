import { TRPCError } from '@trpc/server';
import { trpc } from '../lib/trpc';

export const unAuthedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: null,
    },
  });
});
