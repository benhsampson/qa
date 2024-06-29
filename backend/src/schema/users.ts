import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { dbUtils } from '../utils/db';

export const EMAIL_UNIQUE_INDEX = 'email_unique_index';

export const usersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    password: text('password'),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex(EMAIL_UNIQUE_INDEX).on(
      dbUtils.lower(table.email)
    ),
  })
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
