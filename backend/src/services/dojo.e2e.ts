/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from 'assert/strict';
import { describe, it } from 'node:test';

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

    await t.test('can update dojo', async () => {
      const NEW_NAME = 'My Dojo Updated';

      const updated = await dojoService.update(id, NEW_NAME);
      assert.equal(updated.name, NEW_NAME);
      const queried = await dojoService.getDojoById(id);
      assert.equal(queried?.id, id);
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

    await t.test('1st time', async () => {
      testUtils.assert_.notNullOrUndefined(dojoId);

      await dojoService.addUsersByIds(dojoId, [
        { userId: studentId, role: 'student' },
      ]);
    });

    await t.test('2nd time throws AlreadyAddedToDojoError', async () => {
      await assert.rejects(
        () =>
          dojoService.addUsersByIds(dojoId, [
            { userId: studentId, role: 'student' },
          ]),
        AlreadyAddedToDojoError
      );
    });
  });
});
