import { EnvType, load } from 'ts-dotenv';
 
export type Env = EnvType<typeof schema>;
 
export const schema = {
    API_PORT: Number,
    PRIMARY_CONNECTION_URL: String,
    PRIMARY_CREDENTIALS: String,
    BACKUP_CONNECTION_URL: String,
    BACKUP_CREDENTIALS: String
};
 
export let env: Env;
 
export function loadEnv(): void {
    env = load(schema);
}