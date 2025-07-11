import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SolanaSecretKeyApi implements ICredentialType {
	name = 'solanaSecretKeyApi';
	displayName = 'Solana Secret Key API';
	documentationUrl = 'https://docs.solana.com/developing/clients/jsonrpc-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Solana secret key (as base58 string or JSON array of 64 bytes)',
			placeholder: 'Enter your Solana secret key',
			required: true,
		},
	];
}