export default interface BlockchainInfo {
    height: number,
    difficulty: number,
    hashrate:string,
    currentBlockSize: number,
    totalSmartnodes: number,
    enabledSmartnodes: number,
    pendingTXs: number,
}