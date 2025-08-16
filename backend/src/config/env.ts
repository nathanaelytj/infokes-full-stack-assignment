export interface Env {
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string | undefined;
}

export const env: Env = {
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/postgres",
  REDIS_URL: process.env.REDIS_URL,
};
