import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getSignerFromCredentials } from '../../utils/solanaUtils';

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
				displayName: 'Custom RPC URL',
				name: 'customRpcUrl',
				type: 'string',
				default: '',
				placeholder: 'https://api.mainnet-beta.solana.com',
				description: 'Custom RPC endpoint URL (only used when Network is set to Custom RPC)',
				displayOptions: {
					show: {
						operation: ['walletInfo'],
						network: ['custom'],
					},
				},
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

				// Get network parameters
				const network = this.getNodeParameter('network', 0) as string;
				const customRpcUrl = this.getNodeParameter('customRpcUrl', 0) as string;

				// Set up the connection
				if (network === 'custom') {
					if (!customRpcUrl) {
						throw new NodeOperationError(this.getNode(), 'Custom RPC URL is required when using custom network');
					}
					connection = new Connection(customRpcUrl);
					networkInfo = customRpcUrl;
				} else {
					connection = new Connection(clusterApiUrl(network as any));
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