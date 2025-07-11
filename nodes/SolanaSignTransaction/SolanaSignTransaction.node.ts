import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { VersionedTransaction } from '@solana/web3.js';
import { getSignerFromCredentials } from '../../utils/solanaUtils';

export class SolanaSignTransaction implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Solana Sign Transaction',
		name: 'solanaSignTransaction',
		icon: 'file:solanaLogo.svg',
		group: ['transform'],
		version: 1,
		description: 'Sign Solana transactions using a secret key',
		defaults: {
			name: 'Solana Sign Transaction',
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
				displayName: 'Transaction (Base64)',
				name: 'transaction',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The unsigned transaction encoded as base64. Note: The transaction must have a fee payer set, and the signer must match the fee payer address.',
			},
			{
				displayName: 'Require All Signers',
				name: 'requireAllSigners',
				type: 'boolean',
				default: true,
				description: 'Whether to require all signers to be present (false for partial signing)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		const wallet = await getSignerFromCredentials(this, 'solanaSecretKeyApi');

		// Get the transaction parameter
		const transactionBase64 = this.getNodeParameter('transaction', 0) as string;

		if (!transactionBase64) {
			throw new NodeOperationError(this.getNode(), 'Transaction parameter is required');
		}

		try {
			// Deserialize the versioned transaction from base64
			const transaction = VersionedTransaction.deserialize(Buffer.from(transactionBase64, 'base64'));
			
			// Sign the transaction
			transaction.sign([wallet]);
			
			// Serialize the signed transaction
			const signedTransactionBytes = transaction.serialize();
			
			// Return one result with the signed transaction
			const newItem: INodeExecutionData = {
				json: {
					signedTransaction: Buffer.from(signedTransactionBytes).toString('base64'),
				},
			};

			returnData.push(newItem);
		} catch (error) {
			// Provide a more helpful error message for fee payer issues
			if (error instanceof Error && error.message.includes('fee payer')) {
				throw new NodeOperationError(
					this.getNode(), 
					`Failed to sign transaction: ${error.message}. Make sure the transaction has a fee payer set and the signer address matches the fee payer address.`
				);
			}
			throw new NodeOperationError(this.getNode(), `Failed to sign transaction: ${error}`);
		}

		return this.prepareOutputData(returnData);
	}
}