/* eslint-disable @typescript-eslint/no-floating-promises */

import { describe, it } from 'node:test';
import assert from 'assert/strict';

import { testUtils } from '../utils/testing';
import { createCaller } from './app';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

type Caller = ReturnType<typeof createCaller>;

describe('user router', () => {
  describe('sign up', () => {
    let caller: Caller;
    testUtils.before_(() => {
      caller = createCaller({ user: null });
    });

    it('should reject bad emails and bad passwords', async (t) => {
      const BAD1 = 'test';
      const BAD2 = 'test@test';
      const BAD3 = 'test@.com';
      const GOOD = 'good@test.com';
      const BAD_PASSWORD = 'test';

      testUtils.assert_.notNullOrUndefined(caller);

      for (const bad of [BAD1, BAD2, BAD3, GOOD]) {
        await t.test(async () => {
          await assert.rejects(
            caller.user.signUp({ email: bad, password: BAD_PASSWORD }),
            (err) => {
              assert(err instanceof TRPCError);
              assert(err.cause instanceof ZodError);
              return true;
            }
          );
        });
      }
    });
  });
});
