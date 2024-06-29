import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  DB_CONNECT_STRING: z.string(),
});

export const config = configSchema.parse({
  DB_CONNECT_STRING: process.env.DB_CONNECT_STRING,
});
