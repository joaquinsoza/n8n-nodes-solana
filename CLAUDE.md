# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run build` - Build the package (TypeScript compilation + copy icons via Gulp)
- `npm run dev` - Development mode with TypeScript watch compilation
- `npm run lint` - Run ESLint on nodes, credentials, and package.json
- `npm run lintfix` - Run ESLint with auto-fix
- `npm run format` - Format code using Prettier on nodes and credentials directories
- `npm run prepublishOnly` - Pre-publish validation (build + lint with strict config)

## Architecture Overview

This is an n8n community package providing Solana blockchain operations (transaction signing and wallet public key extraction) for n8n workflows.

### Core Components

**Node Structure:**
- `nodes/SolanaSignTransaction/` - Transaction signing node implementation
- `nodes/SolanaWalletInfo/` - Wallet public key extraction node
- `credentials/SolanaSecretKeyApi.credentials.ts` - Credential definition for Solana secret keys
- `utils/solanaUtils.ts` - Shared utilities for key management and signing operations

**Key Architecture Patterns:**
- Uses n8n's `INodeType` interface for node definitions
- Credential system stores Solana secret keys securely
- Supports both base58-encoded strings and JSON byte arrays for secret key input
- Uses `@solana/web3.js` for transaction handling and `bs58` for encoding
- Error handling focuses on security-conscious messaging (fee payer validation, key format issues)
- SolanaWalletInfo node provides fast public key extraction from credentials without any network calls

### Security Considerations

This package handles Solana private keys and should only be used in trusted, self-hosted environments. The codebase includes validation for:
- Secret key format (base58 or 64-byte JSON array)
- Fee payer requirements in transactions
- Proper error messaging that doesn't leak sensitive information

### Node Descriptions

**SolanaSignTransaction Node:**
- Signs Solana transactions using private keys from SolanaSecretKeyApi credentials
- Validates fee payer requirements and transaction structure
- Returns base64-encoded signed transactions

**SolanaWalletInfo Node:**
- Extracts public key from SolanaSecretKeyApi credentials (no network calls required)
- Fast and simple operation for getting wallet public keys
- Returns JSON with publicKey field

### Build Process

- TypeScript compilation to `dist/` directory
- Gulp task copies SVG icons from nodes to dist
- n8n package structure requires specific exports in package.json `n8n` section
- SolanaSecretKeyApi credential must be registered in package.json
- Supports n8n API version 1

### Dependencies

- `@solana/web3.js` - Core Solana operations
- `bs58` - Base58 encoding/decoding
- n8n workflow framework (peer dependency)