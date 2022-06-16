import express from "express";
import InternalRPCException from "./interfaces/InternalRPCException";
import RPCConnectionManager from "./RPCConnectionManager";
const app = express();
const port: Number = 3000;

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
  res.send('Please see documentation on usage');

  /*const data = await rpcConnectionManager.sendRequest({
    jsonrpc: 2,
    id: "foo",
    method: "getblockhash",
    params: [0],
  });
  if (!data) {
    res.send("No data, check console.");
    return;
  } else if (data instanceof InternalRPCException) {
    res.json({ error: data });
    return;
  }

  res.json(data);*/
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
