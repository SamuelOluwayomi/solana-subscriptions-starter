import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// Jupiter Quote API endpoint
const JUPITER_QUOTE_API_URL = 'https://quote-api.jup.ag/v6';

// Devnet Token Mints
export const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet USDC
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112'); // Native SOL (wrapped)

// Swap configuration
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5% slippage

export interface JupiterQuote {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: any[];
}

export interface JupiterSwapResult {
    swapTransaction: string; // Base64 encoded transaction
    lastValidBlockHeight: number;
}

/**
 * Fetch a swap quote from Jupiter API
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount in smallest unit (e.g., lamports)
 * @param slippageBps - Slippage in basis points (50 = 0.5%)
 */
export async function getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS
): Promise<JupiterQuote> {
    try {
        const params = new URLSearchParams({
            inputMint,
            outputMint,
            amount: amount.toString(),
            slippageBps: slippageBps.toString(),
            onlyDirectRoutes: 'false',
            asLegacyTransaction: 'false',
        });

        // Direct client-side call (bypasses Docker network issues)
        const response = await fetch(`${JUPITER_QUOTE_API_URL}/quote?${params}`, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Quote request failed: ${response.status}`);
        }

        const quote = await response.json();
        return quote;
    } catch (error) {
        console.error('❌ Failed to fetch Jupiter quote:', error);
        throw error;
    }
}

/**
 * Get Jupiter swap transaction
 * @param quote - Quote from getJupiterQuote
 * @param userPublicKey - User's wallet public key
 * @param wrapUnwrapSOL - Whether to wrap/unwrap SOL (default: true)
 */
export async function getJupiterSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: PublicKey,
    wrapUnwrapSOL: boolean = true
): Promise<JupiterSwapResult> {
    try {
        // Direct client-side call (bypasses Docker network issues)
        const response = await fetch(`${JUPITER_QUOTE_API_URL}/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                quoteResponse: quote,
                userPublicKey: userPublicKey.toString(),
                wrapAndUnwrapSol: wrapUnwrapSOL,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: 'auto',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Swap transaction failed: ${response.status}`);
        }

        const swapResult = await response.json();
        return swapResult;
    } catch (error) {
        console.error('❌ Failed to get Jupiter swap transaction:', error);
        throw error;
    }
}

/**
 * Execute a Jupiter swap (gasless via Lazorkit)
 * @param connection - Solana connection
 * @param swapTransaction - Base64 encoded transaction from Jupiter
 * @param signAndSendTransaction - Lazorkit transaction signer
 */
export async function executeJupiterSwap(
    connection: Connection,
    swapTransaction: string,
    signAndSendTransaction: (transaction: VersionedTransaction) => Promise<string>
): Promise<string> {
    try {
        // Deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        console.log('🔄 Executing Jupiter swap (gasless)...');

        // Sign and send via Lazorkit (gasless)
        const signature = await signAndSendTransaction(transaction);

        console.log('✅ Jupiter swap successful!', signature);
        return signature;
    } catch (error) {
        console.error('❌ Jupiter swap execution failed:', error);
        throw error;
    }
}

/**
 * Calculate output amount for display
 * @param quote - Jupiter quote
 * @param outputDecimals - Output token decimals
 */
export function calculateOutputAmount(quote: JupiterQuote, outputDecimals: number = 9): number {
    return parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
}

/**
 * Calculate input amount for display
 * @param quote - Jupiter quote
 * @param inputDecimals - Input token decimals
 */
export function calculateInputAmount(quote: JupiterQuote, inputDecimals: number = 6): number {
    return parseInt(quote.inAmount) / Math.pow(10, inputDecimals);
}

/**
 * Calculate exchange rate
 * @param quote - Jupiter quote
 * @param inputDecimals - Input token decimals
 * @param outputDecimals - Output token decimals
 */
export function calculateExchangeRate(
    quote: JupiterQuote,
    inputDecimals: number = 6,
    outputDecimals: number = 9
): number {
    const inputAmount = calculateInputAmount(quote, inputDecimals);
    const outputAmount = calculateOutputAmount(quote, outputDecimals);
    return outputAmount / inputAmount;
}
