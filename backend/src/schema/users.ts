import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { dbUtils } from '../utils/db';

export const EMAIL_UNIQUE_INDEX = 'email_unique_index';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    password: text('password').notNull(),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex(EMAIL_UNIQUE_INDEX).on(
      dbUtils.lower(table.email)
    ),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
