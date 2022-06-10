/* eslint-disable no-await-in-loop */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function lastNTransactions(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.txNum)
    res.status(400).json({ error: 'Failed to provide number of transactions' });

  let searchBlockHeight: number = parseInt(
    await (
      await fetch(`${process.env.BLOCK_EXPLORER_API_CONN_STRING}/getblockcount`)
    ).text(),
    10
  );

  const downloadedTransactions: string[] = [];
  const txNum = parseInt(req.query.txNum.toString(), 10);

  while (downloadedTransactions.length < txNum) {
    const block = await (
      await fetch(
        `https://35.197.54.25:8443/api/v1/rtm/getblock/${searchBlockHeight}`
      )
    ).json();
    for (let i = 0; i < block.tx.length; i += 1)
      if (downloadedTransactions.length === txNum) break;
      else downloadedTransactions.push(block.tx[i]);
    searchBlockHeight -= 1;
  }
  res.json({
    tx: downloadedTransactions,
  });
}
