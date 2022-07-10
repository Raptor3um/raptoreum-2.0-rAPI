/**
 * Format of a JSON-RPC response from Dash/Raptoreum RPC
 * 
 * @param result RPC output
 * @param error object describing an error; null if no error
 * @param id id associated with an `RPCRequest`
 */
export default interface RPCResponse {
    result: any // null if error
    error: { code: number, message: string } | null,
    id: string
}