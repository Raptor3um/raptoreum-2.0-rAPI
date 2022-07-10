**To access the api, use the following URL: `<DEPLOYMENT_URL>/<ENDPOINT>`**

Endpoints
---------

`lastNTransactions`
-------------------

### Parameters

*   `txNum | number`: Number of transactions to get
    
    ### Response Fields
* `success`: Whether the request resulted in no errors
    
*   `transactions | Transaction[]`: Array of the last N transaction hashes
    
    `blockchainInfo`
    -------------------
    
    ### Parameters
    
*   NONE
    
    ### Response Fields
    
* `success | boolean`: Whether the request resulted in no errors
*   `height | number`: Current blockchain height
*   `hashrate | string`: Pretty-printed current chain hashrate
*   `difficulty | number`: Current chain difficulty
*   `pendingTXs | number`: Number of pending transactions
*   `currentBlockSize | number`: Current size of the block
*   `totalSmartnodes | number`: Total number of smartnodes
*   `enabledSmartnodes | number`: Number of enabled smartnodes
    
    `blockInfo`
    --------------
    
    ### Parameters:
    
*   `blockHeight | number`: Block number for which to get info for
    
    ### Response Fields

*   `success | boolean`: Whether the request resulted in no errors
*   `hash | string`: Block hash
*   `confirmations | number`: Number of accepted blocks further forward in the blockchain
*   `size | number`: Block size
*   `height | number`: Block height
*   `version | number`: Block version
*   `versionHex | string`: Hex-encoded block version
*   `tx | string[]`: Array of transaction hashes included in the block
*   `time | number`: Time the block was mined
*   `nonce | string`: Block nonce
*   `bits | string`: Block header bits
*   `difficulty | number`: Block difficulty
*   `chainwork | string`: Block chainwork
*   `strippedsize | number`: Stripped block size
*   `merkleroot | string`: Block merkle root
*   `mediantime | number`: Block median time
*   `previousblockhash | string`: Previous block hash
*   `nextblockhash | string`: Next block hash
    
    `txInfo`
    -----------
    
    ### Parameters:
    
*   `txID | string`: Transaction hash
    
    ### Response Fields:

*   `success | boolean`: Whether the request resulted in no errors    
*   `id | string`: Transaction hash
*   `size | number`: Transaction size
*   `version | number`: Transaction version
*   `locktime | number`: Transaction lock time
*   `hex | string`: Transaction hex
*   `blockhash | string`: Hash of block the transaction is included in
*   `blockheight | number`: Height of the block the transaction is included in
*   `confirmations | number`: Number of confirmations
*   `timestamp | number`: Time transaction was emitted to the network
*   `inputs | {address: string, rtmAmount: number}[]`: Transaction inputs
*   `outputs | {address: string, rtmAmount: number}[]`: Transaction outputs

    `locked`
    ----------

    ### Parameters

* NONE

    ### Response Fields:

* `success | boolean`: Whether the request resulted in no errors
* `totalLockedCoins | string`: Amount and percentage of locked RTM
    * Format: `<LOCKED_AMOUNT> / <LOCKED_PERCENT>%`