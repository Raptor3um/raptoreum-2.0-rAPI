import { Client, EntityData, Repository } from "redis-om";
import Transaction from "./redis-entities/Transaction.js";
import Block from "./redis-entities/Block.js";
import BlockchainInfo from "./redis-entities/BlockchainInfo.js";
import { blockchainInfo, blockInfo } from "./api-functions.js";
import { blockchainInfoSchema, blockSchema } from "./schemas.js";

import Bluebird from "bluebird";
const { map } = Bluebird;
import { env } from "./env/redis-env.js";
import { rpcConnectionManager } from "./RPCConnectionManager.js";

async function add(
  repository: Repository<Block | BlockchainInfo | Transaction>,
  data: EntityData
) {
  await repository.createAndSave(data);
}

export async function populateBlockchainInfoCache() {
  console.log("Populating blockchain info cache...");
  const client = new Client();
  await client.open(`redis://${env.REDIS_HOST}`);

  const blockchainInfoRepository = client.fetchRepository(blockchainInfoSchema);
  blockchainInfoRepository.createIndex();

  try {
    await add(blockchainInfoRepository, await blockchainInfo());
  } catch (e: any) {
    console.log(`Failed to populate blockchain info cache: \n\n${e}`);
  }

  await client.close();
  console.log("Done!");
}

async function addBlock(latestBlocksRepository: Repository<Block>, block: any) {
  await latestBlocksRepository.createAndSave(block);
}

export async function populateLatestBlocksCache() {
  console.log("Populating latest blocks cache...");
  const client = new Client();
  await client.open(`redis://${env.REDIS_HOST}`);

  try {
    const currentHeight = (
      await rpcConnectionManager.sendRequest({
        method: "getblockcount",
      })
    ).result;
    const latestBlocksRepository = client.fetchRepository(blockSchema);
    latestBlocksRepository.createIndex();
    const promises: Promise<any>[] = [];

    for (let i = 0; i < env.LATEST_BLOCKS_CACHE_NUM; i++) {
      promises.push(blockInfo(currentHeight - i));
    }
    await Promise.all(promises).then(async (data) => {
      await map(data, async (block) => {
        await addBlock(latestBlocksRepository, block);
      });
    });
    console.log("Done!");
  } catch (e: any) {
    console.log(`Failed to populate latest blocks cache:\n\n${e}`);
  }
  await client.close();
}
