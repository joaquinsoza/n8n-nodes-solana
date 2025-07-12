import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SolanaRpcApi implements ICredentialType {
	name = 'solanaRpcApi';
	displayName = 'Solana RPC API';
	documentationUrl = 'https://docs.solana.com/developing/clients/jsonrpc-api';

	properties: INodeProperties[] = [
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
		},
		{
			displayName: 'Custom RPC URL',
			name: 'customRpcUrl',
			type: 'string',
			typeOptions: {
				password: false,
			},
			default: '',
			placeholder: 'https://api.mainnet-beta.solana.com',
			description: 'Custom RPC endpoint URL (only used when Network is set to Custom RPC)',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			required: false,
		},
	];
}