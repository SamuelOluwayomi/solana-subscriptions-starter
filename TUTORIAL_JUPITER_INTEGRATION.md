# Tutorial: Jupiter DEX Integration

Learn how to integrate with Jupiter, Solana's leading DEX aggregator, to enable automated token swaps with **gasless transactions** powered by Lazorkit.

---

## What is Jupiter?

**Jupiter** is the **(DEX aggregator**)** on Solana that routes your trades across multiple decentralized exchanges (Raydium, Orca, Serum, etc.) to find the best possible price.

### Why Use Jupiter?

✅ **Best Rates** - Aggregates liquidity from all major Solana DEXs  
✅ **Smart Routing** - Automatically finds optimal swap paths  
✅ **Low Slippage** - Splits large orders across multiple pools  
✅ **Deep Liquidity** - Access to billions in TVL  

---

## Integration Overview

CadPay integrates Jupiter to enable **auto-swap subscriptions** - users can subscribe to automatically convert USDC → SOL monthly with the best available rates, entirely **gasless**.

### Architecture

```
User Subscribes ($10/month USDC → SOL)
           ↓
Jupiter Quote API (fetch best rate)
           ↓
Build Swap Transaction  
           ↓
Lazorkit Signs (gasless via Paymaster)
           ↓
SOL Deposited to User Wallet
```

---

## Step 1: Install Dependencies

```bash
npm install @jup-ag/api @jup-ag/common
```

---

## Step 2: Create Jupiter Utilities

Create [`src/utils/jupiterSwap.ts`](file:///c:/Users/SAMUEL/Desktop/SAMUEL/Hackathon/solana-subscriptions-starter/src/utils/jupiterSwap.ts):

```typescript
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// Jupiter Quote API
const JUPITER_QUOTE_API_URL = 'https://quote-api.jup.ag/v6';

// Devnet Token Mints
export const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

// Fetch quote from Jupiter API
export async function getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS
): Promise<JupiterQuote> {
    const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${JUPITER_QUOTE_API_URL}/quote?${params}`);
    return await response.json();
}

// Get swap transaction
export async function getJupiterSwapTransaction(
    quote: JupiterQuote,
    userPublicKey: PublicKey
): Promise<JupiterSwapResult> {
    const response = await fetch(`${JUPITER_QUOTE_API_URL}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: userPublicKey.toString(),
            wrapAndUnwrapSol: true,
        }),
    });

    return await response.json();
}

// Execute swap (gasless via Lazorkit)
export async function executeJupiterSwap(
    connection: Connection,
    swapTransaction: string,
    signAndSendTransaction: (tx: VersionedTransaction) => Promise<string>
): Promise<string> {
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Lazorkit sponsors the transaction fee
    const signature = await signAndSendTransaction(transaction);
    return signature;
}
```

---

## Step 3: Create React Hook

Create [`src/hooks/useJupiterSwap.ts`](file:///c:/Users/SAMUEL/Desktop/SAMUEL/Hackathon/solana-subscriptions-starter/src/hooks/useJupiterSwap.ts):

```typescript
import { useState, useCallback } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { Connection } from '@solana/web3.js';
import { getJupiterQuote, executeJupiterSwap } from '../utils/jupiterSwap';

export function useJupiterSwap() {
    const { smartWalletPubkey, signAndSendTransaction } = useWallet();
    const [connection] = useState(() => new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
    ));

    const [state, setState] = useState({
        isFetchingQuote: false,
        isExecuting: false,
        error: null,
        quote: null,
    });

    // Fetch quote
    const fetchQuote = useCallback(async ({ inputAmount, slippageBps = 50 }) => {
        const amountInLamports = Math.floor(inputAmount * 1_000_000);
        const quote = await getJupiterQuote(
            USDC_MINT_DEVNET.toString(),
            SOL_MINT.toString(),
            amountInLamports,
            slippageBps
        );
        setState(prev => ({ ...prev, quote }));
        return quote;
    }, []);

    // Execute swap
    const executeSwap = useCallback(async (quote) => {
        const { swapTransaction } = await getJupiterSwapTransaction(quote, smartWalletPubkey);
        
        // Gasless execution via Lazorkit
        const signature = await executeJupiterSwap(
            connection,
            swapTransaction,
            signAndSendTransaction
        );
        
        return signature;
    }, [smartWalletPubkey, signAndSendTransaction, connection]);

    return { fetchQuote, executeSwap, ...state };
}
```

---

## Step 4: Build the UI

Create a swap modal component:

```typescript
import { useJupiterSwap } from '@/hooks/useJupiterSwap';

export default function JupiterSwapModal() {
    const [inputAmount, setInputAmount] = useState('10');
    const { quote, fetchQuote, executeSwap } = useJupiterSwap();

    // Auto-fetch quote when amount changes
    useEffect(() => {
        if (inputAmount) {
            fetchQuote({ inputAmount: parseFloat(inputAmount) });
        }
    }, [inputAmount]);

    const handleSwap = async () => {
        const signature = await executeSwap(quote);
        console.log('✅ Swap successful!', signature);
    };

    return (
        <div>
            <input 
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="Amount in USDC"
            />
            
            {quote && (
                <div>
                    <p>You receive: {quote.outAmount / 1e9} SOL</p>
                    <p>Rate: 1 USDC ≈ {/* calculated rate */} SOL</p>
                </div>
            )}

            <button onClick={handleSwap}>
                Swap (Gasless) ⚡
            </button>
        </div>
    );
}
```

---

## Step 5: Test on Devnet

### Get Devnet Tokens

1. **Create Wallet** - Visit `/create` and authenticate with biometrics
2. **Get Devnet USDC** - Use the faucet in your dashboard
3. **Try a Swap** - Navigate to `/jupiter` and execute a test swap

### Verify Gasless

Check your wallet's SOL balance before and after swapping - it should remain **0 SOL**, proving the transaction was sponsored by the Paymaster!

---

## How It Works

### 1. Quote Fetching

```typescript
// Jupiter finds best route across all DEXs
const quote = await getJupiterQuote(
    'USDC_MINT',
    'SOL_MINT',
    10_000_000, // 10 USDC (6 decimals)
    50 // 0.5% slippage
);

// Quote contains:
// - inAmount: 10000000 (10 USDC)
// - outAmount: ~400000000 (0.4 SOL, varies by market)
// - priceImpactPct: "0.01" (low impact)
// - routePlan: [Raydium pool, Orca pool, etc.]
```

### 2. Transaction Building

```typescript
// Jupiter builds optimized swap transaction
const { swapTransaction } = await getJupiterSwapTransaction(quote, userPublicKey);

// Returns base64-encoded VersionedTransaction
// Transaction includes:
// - Token account creation (if needed)
// - Swap instructions for all routes
// - Slippage protection
```

### 3. Gasless Execution

```typescript
// Deserialize transaction
const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));

// Lazorkit signs and sponsors gas
const signature = await signAndSendTransaction(transaction);

// User pays 0 SOL for gas! 🎉
```

---

## Advanced: Auto-Swap Subscriptions

Combine Jupiter with subscription logic:

```typescript
// User subscribes to monthly auto-swap
interface JupiterSubscription {
    serviceId: 'jupiter-autoswap';
    plan: 'Monthly $10 USDC → SOL';
    schedule: 'every 30 days';
}

// On billing date:
async function processMonthlySwap(user: User, subscription: JupiterSubscription) {
    // 1. Fetch current quote
    const quote = await fetchQuote({ inputAmount: 10 });
    
    // 2. Execute swap (gasless)
    const signature = await executeSwap(quote);
    
    // 3. Log transaction
    await saveSwapHistory(user.id, signature, quote.outAmount);
}
```

---

## Benefits of Jupiter Integration

| Feature | Traditional DeFi | CadPay + Jupiter |
|---------|-----------------|------------------|
| **Best Rates** | Manual DEX search | ✅ Auto-aggregated |
| **Gas Fees** | User pays ~$0.01 | ✅ **$0.00 (free)** |
| **Slippage Protection** | Manual settings | ✅ Built-in |
| **Multi-hop Routing** | Single DEX | ✅ Cross-DEX |

---

## Troubleshooting

### Quote Fails

```typescript
// Check token mints are correct
console.log('USDC Mint:', USDC_MINT_DEVNET.toString());
console.log('SOL Mint:', SOL_MINT.toString());

// Ensure amount is in lamports
const amountInLamports = inputAmount * 1_000_000; // USDC has 6 decimals
```

### Swap Fails

```typescript
// Ensure wallet has enough USDC
const balance = await getUSDCBalance(userWallet);
if (balance < inputAmount) {
    throw new Error('Insufficient USDC balance');
}

// Check quote is recent (quotes expire after ~30 seconds)
if (Date.now() - quoteTimestamp > 25000) {
    await fetchQuote(); // Refresh quote
}
```

### Transaction Not Gasless

```typescript
// Verify Lazorkit paymaster is configured
console.log('Paymaster URL:', process.env.NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL);

// Ensure using signAndSendTransaction from @lazorkit/wallet
const { signAndSendTransaction } = useWallet(); // ✅ Correct
// NOT window.solana.signTransaction ❌
```

---

## Resources

- [Jupiter API Documentation](https://station.jup.ag/docs/apis/swap-api)
- [Lazorkit SDK Docs](https://docs.lazorkit.com)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [CadPay Jupiter Demo](/jupiter) - Try it live!

---

**Next:** [Devnet Deployment Guide →](./TUTORIAL_DEVNET_DEPLOYMENT.md)
