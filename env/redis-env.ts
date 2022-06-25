import { EnvType, load } from 'ts-dotenv';
 
export type Env = EnvType<typeof schema>;
 
export const schema = {
    REDIS_HOST: String,
    LATEST_BLOCKS_CACHE_NUM: Number,
};
 
export const env: Env = load(schema, "env/redis.env");