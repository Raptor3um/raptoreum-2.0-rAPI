import express from "express";
import RawInput from "./interfaces/RawInput";
import RPCResponse from "./interfaces/RPCResponse";
import Transaction from "./interfaces/Transaction";
import RPCConnectionManager from "./RPCConnectionManager";
import { env } from "./env";
const app = express();
const SMARTNODE_COLLATERAL: number = 1_800_000; // 1.8M RTM to run a masternode

const rpcConnectionManager: RPCConnectionManager = new RPCConnectionManager(
  {
    connectionURL: env.PRIMARY_CONNECTION_URL,
    user: {
      username: env.PRIMARY_CREDENTIALS.split(":")[0],
      password: env.PRIMARY_CREDENTIALS.split(":")[1],
    },
  },
  {
    connectionURL: env.BACKUP_CONNECTION_URL,
    user: {
      username: env.BACKUP_CREDENTIALS.split(":")[0],
      password: env.BACKUP_CREDENTIALS.split(":")[1],
    },
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
      height: blockInfo.result.height,
      version: blockInfo.result.version,
      versionHex: blockInfo.result.versionHex,
      tx: blockInfo.result.tx,
      time: blockInfo.result.time,
      nonce: blockInfo.result.nonce,
      bits: blockInfo.result.bits,
      difficulty: blockInfo.result.difficulty,
      chainwork: blockInfo.result.chainwork,
      merkleroot: blockInfo.result.merkleroot,
      mediantime: blockInfo.result.mediantime,
      previousblockhash: blockInfo.result.previousblockhash,
      nextblockhash: blockInfo.result.nextblockhash,
    });
  } catch (e: any) {
    res.status(500).json(e);
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
    res.status(500).json(e);
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
    res.status(500).json(e);
  }
});

async function parseInput(
  input: RawInput
): Promise<{ address: string; amount: number }> {
  if (input.coinbase) {
    return {
      address: "coinbase",
      amount: -1,
    };
  }

  try {
    // don't use parseTransaction! That will create a recursive loop
    const transaction: RPCResponse = await rpcConnectionManager.sendRequest({
      method: "getrawtransaction",
      params: [input.txid, true],
    });

    return {
      address: transaction.result.vout[input.vout].scriptPubKey.addresses[0],
      amount: transaction.result.vout[input.vout].value,
    };
  } catch (e: any) {
    return { address: "Failed to fetch", amount: -1 };
  }
}

async function parseTransaction(
  txhash: string
): Promise<Transaction | { error: string }> {
  try {
    const transactionData = await rpcConnectionManager.sendRequest({
      method: "getrawtransaction",
      params: [txhash, true], // true == be verbose (describe the transaction in JSON)
    });
    const blockHeight = (
      await rpcConnectionManager.sendRequest({
        method: "getblock",
        params: [transactionData.result.blockhash],
      })
    ).result.height;

    const inputs: { address: string; amount: number }[] = [];
    for (let i = 0; i < transactionData.result.vin.length; i++) {
      inputs.push(await parseInput(transactionData.result.vin[i]));
    }

    const outputs: { address: string; amount: number }[] = [];
    for (let i = 0; i < transactionData.result.vout.length; i++) {
      outputs.push({
        address: transactionData.result.vout[i].scriptPubKey.addresses[0],
        amount: transactionData.result.vout[i].value, // amount of RTM (not ruffs)!
      });
    }

    return {
      hash: transactionData.result.hash,
      size: transactionData.result.size,
      version: transactionData.result.version,
      locktime: transactionData.result.locktime,
      hex: transactionData.result.hex,
      blockhash: transactionData.result.blockHash,
      blockheight: blockHeight,
      confirmations: transactionData.result.confirmations,
      timestamp: transactionData.result.time,
      inputs: inputs,
      outputs: outputs,
    };
  } catch (e: any) {
    return { error: "Failed to parse transaction" };
  }
}

app.get("/txInfo", async (req, res) => {
  try {
    if (!req.query.txHash) {
      res.status(400).json({
        success: false,
        reason: "Failed to provide required parameter `txHash`",
      });
      return;
    }

    res.json({
      sucess: true,
      ...(await parseTransaction(req.query.txHash.toString())),
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
    `Raptoreum 2.0 REST API v1.0.0 listening on port ${env.API_PORT}`
  );
});
