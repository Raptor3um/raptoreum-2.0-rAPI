import { blockchainInfo, blockInfo } from "./api-functions.js";

import Bluebird from "bluebird";
const { map } = Bluebird;
import { env } from "./env/redis-env.js";
import { rpcConnectionManager } from "./RPCConnectionManager.js";
import BlockchainInfo from "./interfaces/BlockchainInfo.js";
import Block from "./interfaces/Block.js";

export async function populateBlockchainInfoCache(client: any) {
  try {
    await client.json.set(`BlockchainInfo`, "$", await blockchainInfo());
  } catch (e: any) {
    console.log(`Failed to populate blockchain info cache: \n\n${e}`);
  }
}

export async function populateLatestBlocksCache(client: any) {
  try {
    const currentHeight = (
      await rpcConnectionManager.sendRequest({
        method: "getblockcount",
      })
    ).result;

    const promises: Promise<any>[] = [];
    for (let i = 0; i < env.LATEST_BLOCKS_CACHE_NUM; i++) {
      promises.push(blockInfo(currentHeight - i));
    }
    await Promise.all(promises).then(async (data) => {
      await map(data, async (block) => {
        await client.json.set(`Block:${block.height}`, "$", block);
      });
    });
  } catch (e: any) {
    console.log(`Failed to populate latest blocks cache:\n\n${e}`);
  }
}

export async function populateLatestTransactionsCache(client: any) {

}

export async function blockchainInfoCache(client: any): Promise<BlockchainInfo | false> {
  const blockchainInfo = await client.json.get("BlockchainInfo");
  return <BlockchainInfo><any>blockchainInfo ?? false;
}

export async function blockInfoCache(client: any, height: number): Promise<Block |false> {
  const blockInfo = await client.json.get(`Block:${height}`);
  return <Block><any>blockInfo ?? false;
}
