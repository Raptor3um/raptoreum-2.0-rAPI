import { NextApiRequest, NextApiResponse } from 'next';
import get from 'axios';

export default async function getBlockInfo(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.blockHeight)
    res
      .status(400)
      .json({ success: false, error: 'Failed to provide Block Height' });

  get(
    `https://35.197.54.25:8443/api/v1/rtm/getblock/${encodeURIComponent(
      req.query.blockHeight.toString() // just in case it's an array from people trying to abuse this endpoint
    )}`
  )
    .then((response) => {
      res.json(response.data);
    })
    .catch(() => {
      // could also be invalid block height
      res.status(400).json({ error: 'Failed to fetch block info' });
    });
}
