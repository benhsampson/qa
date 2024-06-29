/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from 'assert/strict';
import test, { describe, it } from 'node:test';

import { testUtils } from '../utils/testing';
import { preInsertUser } from './user.e2e';
import { dojoService } from './dojo';
import { userService } from './user';
import { db } from '../lib/db';
import { dojos } from '../schema';
import { AlreadyAddedToDojoError } from '../errors/dojo';

export const preInsertDojo = (name: string, userId: number) => async () => {
  const [dojo] = await db
    .insert(dojos)
    .values({ name, master: userId })
    .onConflictDoNothing()
    .returning();
  assert.ok(dojo);
  return dojo;
};

describe(() => {
  const MASTER_EMAIL = 'master@test.e2e';
  const STUDENT_EMAIL = 'student@test.e2e';
  const PASSWORD = 'test';
  let masterId: number;
  let studentId: number;

  testUtils.before_(async () => {
    await preInsertUser(MASTER_EMAIL, PASSWORD)();
    await preInsertUser(STUDENT_EMAIL, PASSWORD)();
    const master = await userService.getUserByEmail(MASTER_EMAIL);
    const student = await userService.getUserByEmail(STUDENT_EMAIL);
    assert.ok(master);
    assert.ok(student);
    masterId = master.id;
    studentId = student.id;
  });

  it('can create a dojo', async (t) => {
    const NAME = 'My Dojo';

    testUtils.assert_.notNullOrUndefined(masterId);
    const { id } = await dojoService.create(NAME, masterId);

    await t.test('has teacher role', async () => {
      assert.equal(await dojoService.hasRole(id, masterId, 'teacher'), true);
    });
  });

  it('can add users to a dojo', async (t) => {
    const NAME = 'My Dojo 2';
    let dojoId: number;

    testUtils.assert_.notNullOrUndefined(masterId);
    testUtils.assert_.notNullOrUndefined(studentId);

    testUtils.before_(async () => {
      const dojo = await preInsertDojo(NAME, masterId)();
      dojoId = dojo.id;
    });

    await t.test('successful', async () => {
      testUtils.assert_.notNullOrUndefined(dojoId);

      await dojoService.addUsers(dojoId, [
        { userId: studentId, role: 'student' },
      ]);
    });

    await t.test(
      'adding same user twice throws AlreadyAddedToDojoError',
      async () => {
        await assert.rejects(
          () =>
            dojoService.addUsers(dojoId, [
              { userId: studentId, role: 'student' },
            ]),
          AlreadyAddedToDojoError
        );
      }
    );
  });
});
