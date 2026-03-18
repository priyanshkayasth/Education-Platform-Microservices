import { config } from 'dotenv';
import { resolve } from 'path';

config({
  path: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});