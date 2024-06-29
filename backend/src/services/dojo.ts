import assert from 'assert/strict';

import { db } from '../lib/db';
import { dojos } from '../schema/dojos';
import {
  type NewUserDojo,
  userDojos,
  type UserDojoRole,
  USER_DOJOS_PK,
} from '../schema/user_dojos';
import { and, eq } from 'drizzle-orm';
import { PostgresError } from 'postgres';
import { POSTGRES_ERROR_CODES } from '../errors/postgres';
import { AlreadyAddedToDojoError } from '../errors/dojo';

const create = async (name: string, userId: number) => {
  return db.transaction(async (tx) => {
    const [dojo] = await tx
      .insert(dojos)
      .values({ name, master: userId })
      .returning();
    assert.ok(dojo);
    await tx
      .insert(userDojos)
      .values({ dojo_id: dojo.id, user_id: userId, role: 'teacher' });
    return dojo;
  });
};

const hasRole = async (dojoId: number, userId: number, role: UserDojoRole) => {
  const [dojo] = await db
    .select({ role: userDojos.role })
    .from(userDojos)
    .where(and(eq(userDojos.dojo_id, dojoId), eq(userDojos.user_id, userId)));
  assert.ok(dojo);
  return dojo.role === role;
};

const addUsers = async (
  dojoId: number,
  usersToAdd: { userId: number; role: UserDojoRole }[]
) => {
  try {
    await db.insert(userDojos).values(
      usersToAdd.map(
        ({ userId, role }): NewUserDojo => ({
          user_id: userId,
          dojo_id: dojoId,
          role,
        })
      )
    );
  } catch (err) {
    if (
      err instanceof PostgresError &&
      err.code === POSTGRES_ERROR_CODES.unique_violation &&
      err.constraint_name === USER_DOJOS_PK
    ) {
      throw new AlreadyAddedToDojoError();
    }
    throw err;
  }
};

export const dojoService = {
  create,
  hasRole,
  addUsers,
};
