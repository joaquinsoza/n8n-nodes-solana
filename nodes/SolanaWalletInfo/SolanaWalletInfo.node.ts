import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { getSignerFromCredentials } from '../../utils/solanaUtils';

export class SolanaWalletInfo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Solana Wallet Info',
		name: 'solanaWalletInfo',
		icon: 'file:solanaLogo.svg',
		group: ['output'],
		version: 1,
		subtitle: 'Get Public Key',
		description: 'Get Solana wallet public key from credentials',
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
		properties: [],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		try {
			const wallet = await getSignerFromCredentials(this, 'solanaSecretKeyApi');
			
			// Get the public key
			const publicKey = wallet.publicKey;
			const publicKeyString = publicKey.toString();

			// Return the public key
			const publicKeyInfo = {
				publicKey: publicKeyString,
			};

			const newItem: INodeExecutionData = {
				json: publicKeyInfo,
			};

			returnData.push(newItem);
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), `Failed to get wallet public key: ${error}`);
		}

		return this.prepareOutputData(returnData);
	}
}