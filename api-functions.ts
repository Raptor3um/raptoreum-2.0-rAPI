import Block from "./interfaces/Block.js";
import BlockchainInfo from "./interfaces/BlockchainInfo.js";
import RawInput from "./interfaces/RawInput.js";
import RPCResponse from "./interfaces/RPCResponse.js";
import Transaction from "./interfaces/Transaction.js";
import { rpcConnectionManager } from "./RPCConnectionManager.js";

const SMARTNODE_COLLATERAL: number = 1_800_000; // 1.8M RTM to run a masternode

export async function blockInfo(height: number): Promise<Block> {
  const blockHash = (
    await rpcConnectionManager.sendRequest({
      method: "getblockhash",
      params: [parseInt(height.toString())],
    })
  ).result;
  const blockInfo = await rpcConnectionManager.sendRequest({
    method: "getblock",
    params: [blockHash, 1],
  });
  return {
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
  };
}

export async function blockchainInfo(): Promise<BlockchainInfo> {
  const smartnodeInfo = await rpcConnectionManager.sendRequest({
    method: "smartnode",
    params: ["count"],
  });
  const miningInfo = await rpcConnectionManager.sendRequest({
    method: "getmininginfo",
  });
  return {
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
  };
}

export async function locked() {
  const totalRTM = (
    await rpcConnectionManager.sendRequest({
      method: "gettxoutsetinfo",
    })
  ).result.total_amount;
  const smartnodeInfo = await rpcConnectionManager.sendRequest({
    method: "smartnode",
    params: ["count"],
  });

  return {
    totalLockedCoins: `${
      smartnodeInfo.result.total * SMARTNODE_COLLATERAL
    } / ${(
      ((smartnodeInfo.result.total * SMARTNODE_COLLATERAL) / totalRTM) *
      100
    ).toFixed(2)}%`,
  };
}

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

export async function txInfo(txhash: string) {
  return {
    ...(await parseTransaction(txhash)),
  };
}
