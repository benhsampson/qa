import { initTRPC } from '@trpc/server';
import { type Context } from './ctx';

export const trpc = initTRPC.context<Context>().create();
