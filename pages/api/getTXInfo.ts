import get from 'axios';

export default function transactionInfo(req, res) {
  if (!req.query.txID)
    res
      .status(400)
      .json({ success: false, error: 'Failed to provide Transaction ID' });

  let data;
  // TODO make this the production API and/or move the address to a .env file or similar
  get(
    `https://35.197.54.25:8443/api/v1/rtm/transactiondetail?txid=${encodeURIComponent(
      req.query.txID
    )}`
  )
    .then((txData) => {
      try {
        data = txData.data;
        const responseData = {
          id: req.query.txID,
          size: data.size,
          version: data.version,
          locktime: data.locktime,
          extraPayload: data.extraPayload,
          extraPayloadSize: data.extraPayloadSize,
          hex: data.hex,
          blockhash: data.blockhash,
          blockheight: data.height,
          confirmations: data.confirmations,
          timestamp: data.time,
          inputs: [],
          outputs: [],
        };
        data.inputs.forEach(
          (input: {
            txid: string;
            addresses: string[];
            index: number;
            value: number;
          }) => {
            responseData.inputs.push({
              address: input.addresses[0],
              rtmAmount: input.value,
            });
          }
        );
        data.outputs.forEach(
          (output: {
            txid: string;
            addresses: string[];
            index: number;
            value: number;
          }) => {
            if (output.addresses)
              responseData.outputs.push({
                address: output.addresses[0],
                rtmAmount: output.value,
              });
            else
              responseData.outputs.push({
                address: null,
                rtmAmount: 0,
              });
          }
        );
        res.json(responseData);
      } catch (e) {
        console.log('possibly invalid transaction hash');
        res.status(400).json({ error: 'Invalid transaction hash' });
      }
    })
    .catch(() => {
      res.status(500).json({ error: 'Failed to fetch transaction info' });
    });
}
