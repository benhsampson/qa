import assert from 'assert/strict';
import { and, eq } from 'drizzle-orm';
import { PostgresError } from 'postgres';

import { db } from '../lib/db';
import { dojos } from '../schema/dojos';
import {
  type NewUserDojo,
  userDojos,
  type UserDojoRole,
  USER_DOJOS_PK,
} from '../schema/user_dojos';
import { POSTGRES_ERROR_CODES } from '../errors/postgres';
import { AlreadyAddedToDojoError, DojoNotFoundError } from '../errors/dojo';

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

const update = async (id: number, name: string) => {
  const [dojo] = await db
    .update(dojos)
    .set({ name })
    .where(eq(dojos.id, id))
    .returning();
  if (!dojo) {
    throw new DojoNotFoundError();
  }
  return dojo;
};

const hasRole = async (id: number, userId: number, role: UserDojoRole) => {
  const [dojo] = await db
    .select({ role: userDojos.role })
    .from(userDojos)
    .where(and(eq(userDojos.dojo_id, id), eq(userDojos.user_id, userId)));
  if (!dojo) {
    throw new DojoNotFoundError();
  }
  return dojo.role === role;
};

const addUsersByIds = async (
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

const getDojoById = async (id: number) => {
  const [dojo] = await db.select().from(dojos).where(eq(dojos.id, id));
  return dojo;
};

export const dojoService = {
  create,
  update,
  hasRole,
  addUsersByIds,
  getDojoById,
};
