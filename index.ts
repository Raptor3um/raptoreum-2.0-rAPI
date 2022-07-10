import express from "express";
import { rpcConnectionManager } from "./RPCConnectionManager.js";
import { env } from "./env/env.js";
import * as redis_env from "./env/redis-env.js";
import { readFileSync } from "fs";
import { blockchainInfo, blockInfo, locked, txInfo } from "./api-functions.js";
import { createClient } from "redis";
import { blockchainInfoCache, blockInfoCache, populateBlockchainInfoCache, populateLatestBlocksCache } from "./redis-helpers.js";

const app = express();

let client = createClient({
  url: `redis://${redis_env.env.REDIS_HOST}`
});
await client.connect();

// remove previous cache
await client.sendCommand(["flushall"]);
// populate Redis cache
await Promise.all([populateBlockchainInfoCache(client), populateLatestBlocksCache(client)]);
await client.quit();

app.get("/", async (req, res) => {
  res.send(readFileSync("./usage.html").toString());
});

app.get("/blockInfo", async (req, res) => {
  if (
    !req.query.height ||
    !parseInt(req.query.height.toString()) ||
    parseInt(req.query.height.toString()) < 0
  ) {
    res.status(400).json({
      success: false,
      reason: "Failed to provide valid required parameter `height`",
    });
    return;
  }

  const currentHeight: number = parseInt(
    (
      await rpcConnectionManager.sendRequest({
        method: "getblockcount",
      })
    ).result
  );
  if (currentHeight < parseInt(req.query.height.toString())) {
    return {
      success: false,
      reason: "block height provided was too high",
    };
  }

  try {
    await client.connect();
    let storedBlock = await blockInfoCache(client, parseInt(req.query.height.toString()));
    if (!storedBlock) {
      storedBlock = await blockInfo(parseInt(req.query.height.toString()));
    }

    res.json({
      success: true,
      ...storedBlock,
    });
    await client.quit();
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.get("/blockchainInfo", async (req, res) => {
  await client.connect();
  let chainInfo = await blockchainInfoCache(client);
  if (!chainInfo) chainInfo = await blockchainInfo();
  try {
    res.json({
      success: true,
      ...chainInfo,
    });
  } catch (e: any) {
    res.status(500).json(e);
  }
  await client.quit();
});

app.get("/locked", async (req, res) => {
  try {
    res.json({
      success: true,
      ...(await locked())
    });
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.get("/txInfo", async (req, res) => {
  if (!req.query.txHash) {
    res.status(400).json({
      success: false,
      reason: "Failed to provide required parameter `txHash`",
    });
    return;
  }

  try {
    res.json({
      success: true,
      ...(await txInfo(req.query.txHash.toString()))
    });
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.get("/lastNTransactions", async (req, res) => {
  if (
    !req.query.txNum ||
    !parseInt(req.query.txNum.toString()) ||
    parseInt(req.query.txNum.toString()) < 1
  ) {
    res.status(400).json({
      success: false,
      reason: "Number of transactions to query is invalid",
    });
    return;
  }

  const transactions: string[] = [];
  const txNum = parseInt(req.query.txNum.toString(), 10);

  try {
    const bestBlockHash = (
      await rpcConnectionManager.sendRequest({ method: "getbestblockhash" })
    ).result;
    let searchBlockHeight = (
      await rpcConnectionManager.sendRequest({
        method: "getblock",
        params: [bestBlockHash],
      })
    ).result.height;

    while (transactions.length < txNum) {
      const blockHash = (
        await rpcConnectionManager.sendRequest({
          method: "getblockhash",
          params: [searchBlockHeight],
        })
      ).result;
      const block = (
        await rpcConnectionManager.sendRequest({
          method: "getblock",
          params: [blockHash],
        })
      ).result;
      for (let i = 0; i < block.tx.length; i += 1)
        if (transactions.length === txNum) break;
        else transactions.push(block.tx[i]);
      searchBlockHeight -= 1;
    }

    res.json({
      success: true,
      transactions: transactions,
    });
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.listen(env.API_PORT, () => {
  console.info(
    `Raptoreum 2.0 REST API v1.1.0 listening on port ${env.API_PORT}`
  );
});
