import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSignerFromCredentials } from '../../utils/solanaUtils';

// Default RPC URLs for standard networks
function getDefaultRpcUrl(network: string): string {
	switch (network) {
		case 'mainnet-beta':
			return 'https://api.mainnet-beta.solana.com';
		case 'devnet':
			return 'https://api.devnet.solana.com';
		case 'testnet':
			return 'https://api.testnet.solana.com';
		default:
			return 'https://api.mainnet-beta.solana.com';
	}
}

export class SolanaWalletInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Solana Wallet Info',
		name: 'solanaWalletInfo',
		icon: 'file:solanaLogo.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Get information about a Solana wallet including public key and optionally balance',
		defaults: {
			name: 'Solana Wallet Info',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'solanaSecretKeyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Public Key Only',
						value: 'publicKeyOnly',
						description: 'Get wallet public key (no RPC calls required)',
						action: 'Get wallet public key no rpc calls required',
					},
					{
						name: 'Get Wallet Info with Balance',
						value: 'walletInfo',
						description: 'Get wallet public key, balance, and account information',
						action: 'Get wallet public key balance and account information',
					},
				],
				default: 'publicKeyOnly',
				description: 'Choose what information to retrieve',
			},
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				options: [
					{
						name: 'Mainnet Beta',
						value: 'mainnet-beta',
						description: 'Solana mainnet (production network)',
					},
					{
						name: 'Devnet',
						value: 'devnet',
						description: 'Solana devnet (development network)',
					},
					{
						name: 'Testnet',
						value: 'testnet',
						description: 'Solana testnet (testing network)',
					},
					{
						name: 'Custom RPC',
						value: 'custom',
						description: 'Use a custom RPC endpoint',
					},
				],
				default: 'mainnet-beta',
				description: 'The Solana network to connect to',
				displayOptions: {
					show: {
						operation: ['walletInfo'],
					},
				},
			},
			{
				displayName: 'RPC Credential',
				name: 'rpcCredential',
				type: 'string',
				typeOptions: {
					credentialType: 'solanaRpcApi',
				},
				default: '',
				description: 'Select a custom RPC credential (required when using Custom RPC)',
				displayOptions: {
					show: {
						operation: ['walletInfo'],
						network: ['custom'],
					},
				},
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		const wallet = await getSignerFromCredentials(this, 'solanaSecretKeyApi');
		const operation = this.getNodeParameter('operation', 0) as string;

		try {
			// Get the public key
			const publicKey = wallet.publicKey;
			const publicKeyString = publicKey.toString();

			if (operation === 'publicKeyOnly') {
				// Return only the public key (no RPC calls)
				const publicKeyInfo = {
					publicKey: publicKeyString,
				};

				const newItem: INodeExecutionData = {
					json: publicKeyInfo,
				};

				returnData.push(newItem);
			} else {
				// Get wallet info with balance - need RPC connection
				let connection: Connection;
				let networkInfo: string;

				// Get network parameter
				const network = this.getNodeParameter('network', 0) as string;

				// Set up the connection based on network
				if (network === 'custom') {
					// Use custom RPC credential
					const rpcCredentials = await this.getCredentials('solanaRpcApi');
					if (!rpcCredentials) {
						throw new NodeOperationError(this.getNode(), 'RPC credential is required when using custom network');
					}

					let rpcUrl: string;
					const credentialNetwork = rpcCredentials.network as string;
					if (credentialNetwork === 'custom' && rpcCredentials.customRpcUrl) {
						rpcUrl = rpcCredentials.customRpcUrl as string;
					} else {
						// Use the credential's network setting with default URLs
						rpcUrl = getDefaultRpcUrl(credentialNetwork);
					}

					connection = new Connection(rpcUrl);
					networkInfo = rpcUrl;
				} else {
					// Use default RPC URLs for standard networks
					const rpcUrl = getDefaultRpcUrl(network);
					connection = new Connection(rpcUrl);
					networkInfo = network;
				}

				// Get balance
				const balanceInLamports = await connection.getBalance(publicKey);
				const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

				// Check if account exists (balance > 0 or has account data)
				const accountInfo = await connection.getAccountInfo(publicKey);
				const accountExists = accountInfo !== null || balanceInLamports > 0;

				// Return wallet information
				const walletInfo = {
					publicKey: publicKeyString,
					balance: {
						lamports: balanceInLamports,
						sol: balanceInSol,
					},
					network: networkInfo,
					accountExists,
					...(accountInfo && {
						accountInfo: {
							owner: accountInfo.owner.toString(),
							executable: accountInfo.executable,
							rentEpoch: accountInfo.rentEpoch,
							dataLength: accountInfo.data.length,
						},
					}),
				};

				const newItem: INodeExecutionData = {
					json: walletInfo,
				};

				returnData.push(newItem);
			}
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), `Failed to get wallet information: ${error}`);
		}

		return this.prepareOutputData(returnData);
	}
}