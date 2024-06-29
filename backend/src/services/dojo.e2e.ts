/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from 'assert/strict';
import { describe, it } from 'node:test';

import { testUtils } from '../utils/testing';
import { preInsertUser } from './user.e2e';
import { dojoService } from './dojo';
import { userService } from './user';

describe('createDojo', () => {
  const EMAIL = 'test5@test.e2e';
  const PASSWORD = 'test';
  const NAME = 'My Dojo';
  let userId: number;

  testUtils.before_(async () => {
    await preInsertUser(EMAIL, PASSWORD)();
    const user = await userService.getUserByEmail(EMAIL);
    assert.ok(user);
    userId = user.id;
  });

  it('can create a dojo', async (t) => {
    testUtils.assert_.notNullOrUndefined(userId);
    const { id } = await dojoService.create(NAME, userId);

    await t.test('has teacher role', async () => {
      assert.equal(await dojoService.hasRole(id, userId, 'teacher'), true);
    });
  });
});
