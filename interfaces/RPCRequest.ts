/**
 * Format of a JSON-RPC request to Dash/Raptoreum RPC
 * 
 * @param jsonrpc JSON-RPC version number; currently ignored by Dash/Raptoreum Core
 * @param id request identifier; not needed unless requests are sent async as race conditions
 * @param method request method
 * @param params request parameters for `method`
 */
export default interface RPCRequest {
    jsonrpc?: number,
    id?: string,
    method: string,
    params?: Array<any> | object
}