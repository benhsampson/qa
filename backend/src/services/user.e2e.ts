/* eslint-disable @typescript-eslint/no-floating-promises */

import { eq } from 'drizzle-orm';
import assert from 'assert/strict';
import { describe, it } from 'node:test';

import { userService } from './user';
import {
  EmailTakenError,
  IncorrectPasswordError,
  UserNotExistsError,
} from '../errors/user';
import { db } from '../lib/db';
import { usersTable } from '../schema';
import { testUtils } from '../utils/testing';

export const preInsertUser = (email: string, password: string) => async () => {
  await db
    .insert(usersTable)
    .values({
      email,
      password: await userService.hashPassword(password),
    })
    .onConflictDoNothing();
};

// with concurrency, just make sure emails are distinct to avoid conflict

describe('signUp', { concurrency: true }, () => {
  const PASSWORD = 'test';

  describe(() => {
    const EMAIL = 'test2@test.e2e';

    it('can sign up', async () => {
      assert.ok(await userService.signUp(EMAIL, PASSWORD));
    });

    testUtils.after_(async () => {
      await db.delete(usersTable).where(eq(usersTable.email, EMAIL));
    });
  });

  describe(() => {
    const EMAIL = 'test@test.e2e';
    const EMAIL2 = 'TesT@teSt.e2E';

    testUtils.before_(preInsertUser(EMAIL, PASSWORD));

    it(
      'should throw EmailTakenError if email taken (case-insensitive)',
      { concurrency: true },
      async (t) => {
        await t.test('same case', async () => {
          await assert.rejects(
            userService.signUp(EMAIL, PASSWORD),
            EmailTakenError
          );
        });
        await t.test('different case', async () => {
          await assert.rejects(
            userService.signUp(EMAIL2, PASSWORD),
            EmailTakenError
          );
        });
      }
    );
  });
});

describe('login', { concurrency: true }, () => {
  const EMAIL = 'test3@test.e2e';
  const EMAIL2 = 'noExist@test.e2e';
  const RIGHT = 'right';
  const WRONG = 'wrong';

  testUtils.before_(preInsertUser(EMAIL, RIGHT));

  it('should throw UserNotExists if email not exists before checking password', async () => {
    await assert.rejects(userService.login(EMAIL2, WRONG), UserNotExistsError);
  });

  it('should throw IncorrectPasswordError if password wrong', async () => {
    await assert.rejects(
      userService.login(EMAIL, WRONG),
      IncorrectPasswordError
    );
  });

  it('can login', async () => {
    await userService.login(EMAIL, RIGHT);
  });
});

describe('getUserProfile', { concurrency: true }, () => {
  const EMAIL = 'test4@test.e2e';
  const PASSWORD = 'test';
  let userId: number;

  testUtils.before_(async () => {
    await preInsertUser(EMAIL, PASSWORD)();
    const user = await userService.getUserByEmail(EMAIL);
    assert.ok(user);
    userId = user.id;
  });

  it('can get profile', async () => {
    testUtils.assert_.notNullOrUndefined(userId);
    const user = await userService.getUserProfile(userId);
    assert.equal(user.id, userId);
    assert.equal(user.email, EMAIL);
  });
});
