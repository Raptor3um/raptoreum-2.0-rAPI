import RPCRequest from "./interfaces/RPCRequest";
import RPCResponse from "./interfaces/RPCResponse";
import RPCConnection from "./interfaces/RPCConnection";

import post, { AxiosRequestConfig } from "axios";
import InternalRPCException from "./interfaces/InternalRPCException";

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
    let requestConfig: AxiosRequestConfig = {
      url: this.primaryConnection.connectionURL,
      method: "POST",
      data: params,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      auth: this.primaryConnection.user,
    };
    try {
      const res = await post(requestConfig);
      return {
        result: res.data.result,
        error: res.data.error,
        id: res.data.id,
      };
    } catch (e: any) {
      if (!e.code) {
        throw new Error(`unknown error ${e.message ? e.message : undefined}`);
      }
      console.warn(
        "Primary daemon connection is unavailable, trying backup..."
      );

      requestConfig.url = this.backupConnection.connectionURL;
      requestConfig.auth = this.backupConnection.user;
      try {
        const res = await post(requestConfig);
        return {
          result: res.data.result,
          error: res.data.error,
          id: res.data.id,
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
