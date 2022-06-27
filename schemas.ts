import { Schema } from "redis-om";
import Block from "./redis-entities/Block.js";
import BlockchainInfo from "./redis-entities/BlockchainInfo.js";

export const blockSchema: Schema<Block> = new Schema(Block, {
  success: { type: "boolean" },
  hash: { type: "string" },
  confirmations: { type: "number" },
  size: { type: "number" },
  height: { type: "number" },
  version: { type: "number" },
  versionHex: { type: "string" },
  tx: { type: "string[]" },
  time: { type: "number" },
  nonce: { type: "number" },
  bits: { type: "string" },
  difficulty: { type: "number" },
  chainwork: { type: "string" },
  merkleroot: { type: "string" },
  mediantime: { type: "number" },
  previousblockhash: { type: "string" },
  nextblockhash: { type: "string" },
});

export const blockchainInfoSchema: Schema<BlockchainInfo> = new Schema(Block, {
    success: { type: "boolean" },
    height: { type: "number" },
    difficulty: { type: "number" },
    hashrate: { type: "string" },
    currentBlockSize: { type: "number" },
    totalSmartnodes: { type: "number" },
    enabledSmartnodes: { type: "number" },
    pendingTXs: { type: "number" },
});
