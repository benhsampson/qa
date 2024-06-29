import assert from 'assert/strict';
import { and, eq, inArray } from 'drizzle-orm';
import { PostgresError } from 'postgres';
import _ from 'lodash';

import { db } from '../lib/db';
import { dojosTable } from '../schema/dojos';
import {
  type NewUserDojo,
  userDojosTable,
  type UserDojoRole,
  USER_DOJOS_PK,
} from '../schema/user_dojos';
import { POSTGRES_ERROR_CODES } from '../errors/postgres';
import { AlreadyAddedToDojoError, DojoNotFoundError } from '../errors/dojo';
import { usersTable } from '../schema';

const create = async (name: string, userId: number) => {
  return db.transaction(async (tx) => {
    const [dojo] = await tx
      .insert(dojosTable)
      .values({ name, master: userId })
      .returning();
    assert.ok(dojo);
    await tx
      .insert(userDojosTable)
      .values({ dojo_id: dojo.id, user_id: userId, role: 'teacher' });
    return dojo;
  });
};

const update = async (id: number, name: string) => {
  const [dojo] = await db
    .update(dojosTable)
    .set({ name })
    .where(eq(dojosTable.id, id))
    .returning();
  if (!dojo) {
    throw new DojoNotFoundError();
  }
  return dojo;
};

const hasRole = async (id: number, userId: number, role: UserDojoRole) => {
  const [dojo] = await db
    .select({ role: userDojosTable.role })
    .from(userDojosTable)
    .where(
      and(eq(userDojosTable.dojo_id, id), eq(userDojosTable.user_id, userId))
    );
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
    await db.insert(userDojosTable).values(
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

const addUsersByEmails = async (
  dojoId: number,
  usersToAdd: { email: string; role: UserDojoRole }[]
) => {
  const emailToUser = _.keyBy(usersToAdd, 'email');
  const emailsToAdd = _.keys(emailToUser);

  if (emailsToAdd.length === 0) return [];

  const columns = { id: usersTable.id, email: usersTable.email };
  const existingUsers = await db
    .select(columns)
    .from(usersTable)
    .where(inArray(usersTable.email, emailsToAdd));

  {
    const existingUserDojos =
      existingUsers.length > 0
        ? await db
            .select()
            .from(userDojosTable)
            .where(
              inArray(
                userDojosTable.user_id,
                existingUsers.map((u) => u.id)
              )
            )
            .innerJoin(usersTable, eq(userDojosTable.user_id, usersTable.id))
        : [];
    if (existingUserDojos.length > 0) {
      throw new AlreadyAddedToDojoError(
        `Users ${existingUserDojos.map((ud) => ud.users.email).join(', ')} already added.`
      );
    }
  }

  return db.transaction(async (tx) => {
    const existingEmails = existingUsers.map((u) => u.email);
    const newEmails = _.difference(emailsToAdd, existingEmails);
    // create "ghost" users for those that don't exist yet
    const newUsers =
      newEmails.length > 0
        ? await tx
            .insert(usersTable)
            .values(newEmails.map((email) => ({ email })))
            .returning(columns)
        : [];
    const allUsers = [...existingUsers, ...newUsers];
    assert.equal(allUsers.length, emailsToAdd.length);

    const userDojos =
      allUsers.length > 0
        ? await tx
            .insert(userDojosTable)
            .values(
              allUsers.map((u) => ({
                dojo_id: dojoId,
                user_id: u.id,
                role: emailToUser[u.email]!.role,
              }))
            )
            .returning()
        : [];
    assert.equal(userDojos.length, allUsers.length);

    return userDojos;
  });
};

const getDojoById = async (id: number) => {
  const [dojo] = await db
    .select()
    .from(dojosTable)
    .where(eq(dojosTable.id, id));
  return dojo;
};

export const dojoService = {
  create,
  update,
  hasRole,
  addUsersByIds,
  getDojoById,
  addUsersByEmails,
};
