import { integer, pgEnum, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const USER_DOJOS_PK = 'user_dojos_pk';

export const userDojoRole = pgEnum('user_dojo_role', ['student', 'teacher']);

export const userDojosTable = pgTable(
  'user_dojos',
  {
    user_id: integer('user_id').notNull(),
    dojo_id: integer('dojo_id').notNull(),
    role: userDojoRole('role').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: USER_DOJOS_PK,
      columns: [table.user_id, table.dojo_id],
    }),
  })
);

export type UserDojo = typeof userDojosTable.$inferSelect;
export type NewUserDojo = typeof userDojosTable.$inferInsert;

const e = z.enum(userDojoRole.enumValues);
export type UserDojoRole = z.infer<typeof e>;
