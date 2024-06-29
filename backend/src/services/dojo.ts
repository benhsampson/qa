import assert from 'assert/strict';

import { db } from '../lib/db';
import { dojos } from '../schema/dojos';
import { userDojos, type UserDojoRole } from '../schema/user_dojos';
import { and, eq } from 'drizzle-orm';

const create = async (name: string, userId: number) => {
  const [dojo] = await db
    .insert(dojos)
    .values({ name, master: userId })
    .returning();
  assert.ok(dojo);
  await db
    .insert(userDojos)
    .values({ dojo_id: dojo.id, user_id: userId, role: 'teacher' })
    .returning();
  return dojo;
};

const hasRole = async (dojoId: number, userId: number, role: UserDojoRole) => {
  const [dojo] = await db
    .select({ role: userDojos.role })
    .from(userDojos)
    .where(and(eq(userDojos.dojo_id, dojoId), eq(userDojos.user_id, userId)));
  assert.ok(dojo);
  return dojo.role === role;
};

export const dojoService = {
  create,
  hasRole,
};
