import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const dojosTable = pgTable('dojos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  master: integer('master')
    .references(() => usersTable.id)
    .notNull(),
});

export type Dojo = typeof dojosTable.$inferSelect;
export type NewDojo = typeof dojosTable.$inferInsert;
