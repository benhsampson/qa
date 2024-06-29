import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import { config } from '../lib/config';

const queryClient = postgres(config.DB_CONNECT_STRING);
export const db = drizzle(queryClient);
