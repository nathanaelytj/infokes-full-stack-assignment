import Redis from "ioredis";
import { env } from "../../config/env";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!client) client = new Redis(env.REDIS_URL);
  return client;
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return load();

  const cachedVal = await redis.get(key);
  if (cachedVal) return JSON.parse(cachedVal) as T;

  const result = await load();
  await redis.set(key, JSON.stringify(result), "EX", ttlSeconds);
  return result;
}

export async function invalidate(keys: string[]) {
  const redis = getRedis();
  if (!redis) return;
  if (keys.length) await redis.del(keys);
}
