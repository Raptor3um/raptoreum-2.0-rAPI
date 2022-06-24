import express from "express";
import { rpcConnectionManager } from "./RPCConnectionManager.js";
import { env } from "./env/env.js";
import { readFileSync } from "fs";
import { blockchainInfo, blockInfo, locked, txInfo } from "./api-functions.js";

const app = express();

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

  try {
    res.json(await blockInfo(parseInt(req.query.height.toString())));
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.get("/blockchainInfo", async (req, res) => {
  try {
    res.json(await blockchainInfo());
  } catch (e: any) {
    res.status(500).json(e);
  }
});

app.get("/locked", async (req, res) => {
  try {
    res.json(await locked());
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
    res.json(await txInfo(req.query.txHash.toString()));
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
    `Raptoreum 2.0 REST API v1.0.0 listening on port ${env.API_PORT}`
  );
});
