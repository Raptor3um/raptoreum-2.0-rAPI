import { createClient } from 'redis';
import { env } from "./env/redis-env.js";
import { populateBlockchainInfoCache, populateLatestBlocksCache } from './redis-helpers.js';

const client = createClient({
  url: `redis://${env.REDIS_HOST}`
});
await client.connect();

// remove previous cache
await client.sendCommand(["flushall"]);

// populate Redis cache
await Promise.all([populateBlockchainInfoCache(client), populateLatestBlocksCache(client)]);

await client.quit();
