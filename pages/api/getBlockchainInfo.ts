import { NextApiRequest, NextApiResponse } from 'next';

//! this is a demo, not for production use
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

export default async function getBlockchainInfo(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const miningInfo = await (
    await fetch(`${process.env.BLOCK_EXPLORER_API_CONN_STRING}/getmininginfo`)
  ).json();
  const explorerExtData = await (
    await fetch('https://explorer.raptoreum.com/ext/summary')
  ).json();

  const smartnodeCount = await (await fetch(`${process.env.BLOCK_EXPLORER_API_CONN_STRING}/getmasternodecount`)).text();
  res.json({
    currentBlockHeight: miningInfo.blocks,
    currentHashrateFormatted: explorerExtData.hashrate.rate + explorerExtData.hashrate.unit.slice(0, 3),
    difficulty: parseFloat(miningInfo.difficulty),
    pendingTXNumber: miningInfo.pooledtx,
    currentBlockSize: miningInfo.currentblocksize,
    smartnodeCount: parseInt(smartnodeCount.split('/')[1]),
    reachableSmartnodeCount: parseInt(smartnodeCount.split('/')[0]),
    totalLockedCoins: await (
      await fetch(
        `${process.env.BLOCK_EXPLORER_API_CONN_STRING}/gettotallockedcoins`
      )
    ).text(),
    marketCap: await (
      await fetch(`${process.env.BLOCK_EXPLORER_API_CONN_STRING}/marketcap`)
    ).text(),
    circulatingSupply: await (
      await fetch(`${process.env.BLOCK_EXPLORER_API_CONN_STRING}/supply`)
    ).text(),
    txCount: parseInt(explorerExtData.txcount.split(',').join(''), 10),
    price: explorerExtData.price,
  });
}
