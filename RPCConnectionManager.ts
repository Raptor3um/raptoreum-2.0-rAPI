import RPCRequest from "./interfaces/RPCRequest.js";
import RPCResponse from "./interfaces/RPCResponse.js";
import RPCConnection from "./interfaces/RPCConnection.js";

import fetch from "node-fetch";
import InternalRPCException from "./interfaces/InternalRPCException.js";

import { env } from "./env/env.js";

export default class RPCConnectionManager {
  private primaryConnection: RPCConnection;
  private backupConnection: RPCConnection;

  constructor(
    primaryConnection: RPCConnection,
    backupConnection: RPCConnection
  ) {
    this.primaryConnection = primaryConnection;
    this.backupConnection = backupConnection;
  }

  async sendRequest(params: RPCRequest): Promise<RPCResponse> {
    try {
      const res: any = await (
        await fetch(this.primaryConnection.connectionURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Basic ${Buffer.from(
              `${this.primaryConnection.user.username}:${this.primaryConnection.user.password}`,
              "binary"
            ).toString("base64")}`,
          },
          body: JSON.stringify(params),
        })
      ).json();
      return {
        result: res.result,
        error: res.error,
        id: res.id,
      };
    } catch (e: any) {
      if (!e.code) {
        throw new Error(`unknown error ${e.message ? e.message : undefined}`);
      }
      console.warn(
        "Primary daemon connection is unavailable, trying backup..."
      );

      try {
        const res: any = await (
          await fetch(this.backupConnection.connectionURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: Buffer.from(
                `${this.backupConnection.user.username}:${this.backupConnection.user.password}`,
                "binary"
              ).toString("base64"),
            },
            body: JSON.stringify(params),
          })
        ).json();
        return {
          result: res.result,
          error: res.error,
          id: res.id,
        };
      } catch (e: any) {
        if (!e.code) {
          throw new Error(`Unkown error ${e.message ? e.message : undefined}`);
        }
        throw new InternalRPCException("DAEMONS_UNAVAILABLE");
      }
    }
  }
}

export const rpcConnectionManager: RPCConnectionManager = new RPCConnectionManager(
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
