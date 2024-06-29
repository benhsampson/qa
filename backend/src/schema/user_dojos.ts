import { integer, pgEnum, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const USER_DOJOS_PK = 'user_dojos_pk';

export const userDojoRole = pgEnum('user_dojo_role', ['student', 'teacher']);

export const userDojos = pgTable(
  'user_dojos',
  {
    user_id: integer('user_id'),
    dojo_id: integer('dojo_id'),
    role: userDojoRole('role'),
  },
  (table) => ({
    pk: primaryKey({
      name: USER_DOJOS_PK,
      columns: [table.user_id, table.dojo_id],
    }),
  })
);

const e = z.enum(userDojoRole.enumValues);
export type UserDojoRole = z.infer<typeof e>;
