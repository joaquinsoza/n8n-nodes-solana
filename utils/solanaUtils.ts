import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';

export async function getSignerFromCredentials(
	executeFunctions: IExecuteFunctions,
	credentialType: string,
): Promise<Keypair> {
	const credentials = await executeFunctions.getCredentials(credentialType);
	
	if (!credentials || !credentials.secretKey) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'No credentials provided or secret key missing',
		);
	}

	const rawKey = credentials.secretKey as string;

	if (!rawKey) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'Secret key is empty',
		);
	}

	return loadSigner(rawKey);
}

function loadSigner(raw: string): Keypair {
	try {
		let bytes: Uint8Array;
		
		// Try to parse as JSON array first
		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed) && parsed.length === 64) {
				bytes = Uint8Array.from(parsed);
			} else {
				throw new Error('Invalid JSON array format');
			}
		} catch {
			// If JSON parsing fails, treat as base58 string
			bytes = bs58.decode(raw);
		}

		if (bytes.length !== 64) {
			throw new Error(`Expected 64 bytes, got ${bytes.length}`);
		}

		return Keypair.fromSecretKey(bytes);
	} catch (error) {
		throw new Error(`Failed to load signer: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}