# n8n-nodes-solana

This is an n8n community package for Solana blockchain operations. It lets you sign transactions and extract wallet information using Solana secret keys in your n8n workflows.

Solana is a high-performance blockchain platform designed for decentralized applications and crypto-currencies.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## ⚠️ Security Warning

**IMPORTANT**: This package requires access to your Solana private keys for signing operations. Please be aware of the following security considerations:

- **Never use this package in n8n Cloud or any untrusted environment** - Any system running this package will have full access to your signing keys
- **Only use in self-hosted n8n instances** that you fully control and trust
- **Store private keys securely** using environment variables, never hardcode them
- **Use dedicated signing keys** - Consider using keys specifically for automated workflows rather than your main wallet keys
- **Audit your workflows** - Ensure only trusted parties have access to workflows using these nodes
- **Monitor key usage** - Keep track of what transactions are being signed

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This package provides two nodes:

### Solana Sign Transaction
Signs Solana transactions using a secret key.

**Input**: Base64-encoded unsigned transaction
**Output**: Base64-encoded signed transaction ready for broadcast

### Solana Wallet Info
Extracts the public key from a Solana secret key credential.

**Input**: No input parameters required
**Output**: JSON object containing the wallet's public key

## Credentials

### Solana Secret Key API
Set up credentials by providing:
- **Secret Key**: Your Solana secret key (stored securely in n8n)

The secret key should be either:
- A base58-encoded secret key string, OR  
- A JSON array of 64 bytes (e.g., `[1,2,3,...]`)

Example secret key formats:
- Base58: `5J7XqnKdA8Bg6cW8aX9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9`
- JSON Array: `[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]`

## Compatibility

This package requires n8n version 1.0.0 or higher.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Solana Cookbook - Sign & Verify Messages](https://solanacookbook.com/references/off-chain/sign-off-chain-message.html)
* [QuickNode - Send Transactions with Solana Kit](https://www.quicknode.com/guides/solana-development/transactions/solana-kit)
* [Solana Web3.js Documentation](https://docs.solana.com/developing/clients/javascript-api)

## License

[MIT](https://github.com/n8n-io/n8n-nodes-solana/blob/master/LICENSE.md)