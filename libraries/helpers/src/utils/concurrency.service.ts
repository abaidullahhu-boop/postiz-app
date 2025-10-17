import Bottleneck from "bottleneck";
import IORedis from "ioredis";
import { ioRedis as gitroomRedis } from "@gitroom/nestjs-libraries/redis/redis.service";
import { BadBody } from "@gitroom/nestjs-libraries/integrations/social.abstract";

// 🧩 Fallback logic — works both locally and in Railway
const redisClient =
  gitroomRedis?.setMaxListeners // if it's a valid redis instance
    ? gitroomRedis
    : new IORedis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });

const connection = new Bottleneck.IORedisConnection({ client: redisClient });

const mapper: Record<string, Bottleneck> = {};

export const concurrency = async <T>(
  identifier: string,
  maxConcurrent = 1,
  func: (...args: any[]) => Promise<T>,
  ignoreConcurrency = false
) => {
  const strippedIdentifier = identifier.toLowerCase().split("-")[0];

  mapper[strippedIdentifier] ??= new Bottleneck({
    id: strippedIdentifier + "-concurrency-new",
    maxConcurrent,
    datastore: "ioredis",
    connection,
    minTime: 1000,
  });

  if (ignoreConcurrency) return func();

  try {
    return await mapper[strippedIdentifier].schedule<T>(
      { expiration: 60000 },
      async () => await func()
    );
  } catch (err) {
    console.error("Concurrency error:", err);
    throw new BadBody(
      identifier,
      JSON.stringify({}),
      {} as any,
      `Something went wrong with ${identifier}`
    );
  }
};
