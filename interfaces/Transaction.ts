export default interface Transaction {
    hash: string,
    size: number,
    version: number,
    locktime: number,
    hex: string,
    blockhash: string,
    blockheight: number,
    confirmations: number,
    timestamp: string,
    inputs: {address: string, amount: number}[],
    outputs: {address: string, amount: number}[],
}