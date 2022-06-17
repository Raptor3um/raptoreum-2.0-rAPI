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
    const currentHeight: number = parseInt(
      (
        await rpcConnectionManager.sendRequest({
          method: "getblockcount",
        })
      ).result
    );

    if (currentHeight < parseInt(req.query.height.toString())) {
      res.status(400).json({
        success: false,
        reason: "block height provided was too high",
      });
      return;
    }

    const blockHash = (
      await rpcConnectionManager.sendRequest({
      method: "getblockhash",
      params: [parseInt(req.query.height.toString())],
      })
    ).result;
    const blockInfo = await rpcConnectionManager.sendRequest({
      method: "getblock",
      params: [blockHash, 1],
    });
    res.json({
      success: true,
      hash: blockInfo.result.hash,
      confirmations: blockInfo.result.confirmations,
      size: blockInfo.result.size,
      // weight: 0, // can't find an RPC with this data
      height: blockInfo.result.height,
      version: blockInfo.result.version,
      versionHex: blockInfo.result.versionHex,
      tx: blockInfo.result.tx,
      time: blockInfo.result.time,
      nonce: blockInfo.result.nonce,
      bits: blockInfo.result.bits,
      difficulty: blockInfo.result.difficulty,
      chainwork: blockInfo.result.chainwork,
      // "strippedsize": 0, // can't find an RPC with this data
      merkleroot: blockInfo.result.merkleroot,
      mediantime: blockInfo.result.mediantime,
      previousblockhash: blockInfo.result.previousblockhash,
      nextblockhash: blockInfo.result.nextblockhash,
    });
  } catch (e: any) {
    res.json(e);
  }
});

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
      success: true,
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

app.get("/locked", async (req, res) => {
  try {
    const totalRTM = (
      await rpcConnectionManager.sendRequest({
        method: "gettxoutsetinfo",
      })
    ).result.total_amount;
    const smartnodeInfo = await rpcConnectionManager.sendRequest({
      method: "smartnode",
      params: ["count"],
    });

    res.json({
      success: true,
      totalLockedCoins: `${
        smartnodeInfo.result.total * SMARTNODE_COLLATERAL
      } / ${(
        ((smartnodeInfo.result.total * SMARTNODE_COLLATERAL) / totalRTM) *
        100
      ).toFixed(2)}%`,
    });
  } catch (e: any) {
    res.json(e);
  }
});

app.listen(port, () => {
  console.log(`Raptoreum 2.0 REST API v1.0.0 listening on port ${port}`);
});
