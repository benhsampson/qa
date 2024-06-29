import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { users } from './users';

export const dojos = pgTable('dojos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  master: integer('master')
    .references(() => users.id)
    .notNull(),
});

export type Dojo = typeof dojos.$inferSelect;
export type NewDojo = typeof dojos.$inferInsert;
