import express from "express";
import RPCConnectionManager from "./RPCConnectionManager";
const app = express();
const port: Number = 3000;
const SMARTNODE_COLLATERAL: number = 1_800_000; // 1.8M RTM to run a masternode

const rpcConnectionManager: RPCConnectionManager = new RPCConnectionManager(
  {
    protocol: "http",
    hostname: "localhost",
    port: 9998,
    user: { username: "debug", password: "debug" },
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: 9998,
    user: { username: "debug", password: "debug" },
  }
);

app.get("/", async (req, res) => {
  res.send("Please see documentation on usage");
});

app.get("/blockInfo", async (req, res) => {
  if (!req.query.height || !parseInt(req.query.height.toString()) || parseInt(req.query.height.toString()) < 0) {
    res.status(400).json({
      success: false,
      reason: "Failed to provide valid required parameter `height`",
    });
    return;
  }

  // how many H/s one "diff" is
  try {
    const currentHeight: number = parseInt((await rpcConnectionManager.sendRequest({
      method: 'getblockcount'
    })).result);

    if (currentHeight < parseInt(req.query.height.toString())) {
      res.status(400).json({
        success: false,
        reason: "block height provided was too high"
      });
      return;
    }

    const blockHash = (await rpcConnectionManager.sendRequest({
      method: "getblockhash",
      params: [parseInt(req.query.height.toString())],
    })).result;
    const blockInfo = await rpcConnectionManager.sendRequest({
      method: "getblock",
      params: [blockHash, 1],
    });
    res.json({
      hash: blockInfo.result.hash,
      confirmations: blockInfo.result.confirmations,
      size: blockInfo.result.size,
      // weight: 0, // not sure if that's a thing with this RPC endpoint
      height: blockInfo.result.height,
      version: blockInfo.result.version,
      versionHex: blockInfo.result.versionHex,
      tx: blockInfo.result.tx,
      time: blockInfo.result.time,
      nonce: blockInfo.result.nonce,
      bits: blockInfo.result.bits,
      difficulty: blockInfo.result.difficulty,
      chainwork: blockInfo.result.chainwork,
      // "strippedsize": 0, // not sure if that's a thing with this RPC endpoint
      merkleroot: blockInfo.result.merkleroot,
      mediantime: blockInfo.result.mediantime,
      previousblockhash: blockInfo.result.previousblockhash,
app.get("/blockchainInfo", async (req, res) => {
  try {
    const smartnodeInfo = await rpcConnectionManager.sendRequest({
      method: "smartnode",
      params: ["count"],
    });
    const miningInfo = await rpcConnectionManager.sendRequest({
      method: "getmininginfo",
    });
    res.json({
      height: miningInfo.result.blocks,
      difficulty: miningInfo.result.difficulty,
      hashrate:
        Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 3,
        }).format(miningInfo.result.networkhashps) + "H/s",
      currentBlockSize: miningInfo.result.currentblocksize,
      totalSmartnodes: smartnodeInfo.result.total,
      enabledSmartnodes: smartnodeInfo.result.enabled,
      pendingTXs: miningInfo.result.pooledtx,
    });
  } catch (e: any) {
    res.json(e);
  }
});
    });
  } catch (e: any) {
    res.json(e);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
