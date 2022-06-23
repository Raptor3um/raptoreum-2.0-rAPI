import { EnvType, load } from 'ts-dotenv';
 
export type Env = EnvType<typeof schema>;
 
export const schema = {
    REDIS_HOST: String
};
 
export const env: Env = load(schema, "env/redis.env");