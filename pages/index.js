export default function Home() {
	return (
		<>
			<p>This is probably not where you were intending to go for a REST API request.</p>
			<br />
			<p>Please read below on REST API usage:</p>
			<br />

			{/* Auto-generated HTML from markdown */}
			<h1 id="using-the-raptoreum-2-0-api">Using The Raptoreum 2.0 API</h1>
			<p>To access the api, use the following URL: <code>&lt;DEPLOYMENT_URL&gt;/api/&lt;ENDPOINT&gt;</code></p>
			<h2 id="endpoints">Endpoints</h2>
			<h2 id="-lastntransactions-"><code>lastNTransactions</code></h2>
			<h3 id="parameters">Parameters</h3>
			<ul>
				<li><code>txNum | number</code>: Number of transactions to get<h3 id="response-fields">Response Fields</h3>
				</li>
				<li><code>tx | string[]</code>: Array of the last N transaction hashes<h2 id="-getblockchaininfo-"><code>getBlockchainInfo</code></h2>
					<h3 id="parameters">Parameters</h3>
				</li>
				<li>NONE<h3 id="response-fields">Response Fields</h3>
				</li>
				<li><code>currentBlockchainHeight | number</code>: Current blockchain height</li>
				<li><code>currentHashrateFormatted | string</code>: Pretty-printed current chain hashrate</li>
				<li><code>difficulty | number</code>: Current chain difficulty</li>
				<li><code>pendingTXNumber | number</code>: Number of pending transactions</li>
				<li><code>currentBlockSize | number</code>: Current size of the block</li>
				<li><code>smartnodeCount | string</code>: Current <code>REACHABLE/TOTAL</code> smartnode count</li>
				<li><code>totalLockedCoins | string</code>: Current <code>AMOUNT/PERCENTAGE</code> locked in smartnodes</li>
				<li><code>marketCap | string</code>: Current <code>BTC/USD</code> market cap</li>
				<li><code>circulatingSupply | string</code>: Current RTM circulating supply as a stringified <code>double</code></li>
				<li><code>txCount | number</code>: Total number of TXs made on the Raptoreum blockchain</li>
				<li><code>price | string</code>: Current <code>BTC/USD</code> price of Raptoreum<h2 id="-getblockinfo-"><code>getBlockInfo</code></h2>
					<h3 id="parameters-">Parameters:</h3>
				</li>
				<li><code>blockHeight | number</code>: Block number for which to get info for<h3 id="response-fields">Response Fields</h3>
				</li>
				<li><code>hash | string</code></li>
				<li><code>confirmations | number</code></li>
				<li><code>size | number</code></li>
				<li><code>weight | number</code></li>
				<li><code>height | number</code></li>
				<li><code>version | number</code></li>
				<li><code>versionHex | string</code>: Hex-encoded block version</li>
				<li><code>tx | string[]</code>: Array of transactions included in the block</li>
				<li><code>time | number</code></li>
				<li><code>nonce | string</code></li>
				<li><code>bits | string</code></li>
				<li><code>difficulty | number</code></li>
				<li><code>chainwork | string</code></li>
				<li><code>strippedsize | number</code></li>
				<li><code>merkleroot | string</code></li>
				<li><code>mediantime | number</code></li>
				<li><code>previousblockhash | string</code></li>
				<li><code>nextblockhash | string</code><h2 id="-gettxinfo-"><code>getTXInfo</code></h2>
					<h3 id="parameters-">Parameters:</h3>
				</li>
				<li><code>txID | string</code>: Transaction hash<h3 id="response-fields-">Response Fields:</h3>
				</li>
				<li><code>id | string</code>: Transaction hash</li>
				<li><code>size | number</code></li>
				<li><code>version | number</code></li>
				<li><code>locktime | number</code></li>
				<li><code>extraPayload | string</code></li>
				<li><code>extraPayloadSize | number</code></li>
				<li><code>hex | string</code></li>
				<li><code>blockhash | string</code></li>
				<li><code>blockheight | number</code></li>
				<li><code>confirmations | number</code></li>
				<li><code>timestamp | number</code></li>
				<li><code>inputs | {`{address: string, rtmAmount: number}[]`}</code></li>
				<li><code>outputs | {`{address: string, rtmAmount: number}[]`}</code></li>
			</ul>
		</>
	);
}
