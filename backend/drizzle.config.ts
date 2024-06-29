import { defineConfig } from 'drizzle-kit';

import { config } from './src/lib/config';

export default defineConfig({
  schema: './src/schema',
  out: './.drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DB_CONNECT_STRING,
  },
});
