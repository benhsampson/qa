import { type SQL, sql } from 'drizzle-orm';
import { type AnyPgColumn } from 'drizzle-orm/pg-core';

const lower = (text: AnyPgColumn): SQL => {
  return sql`lower(${text})`;
};

export const dbUtils = {
  lower,
};
