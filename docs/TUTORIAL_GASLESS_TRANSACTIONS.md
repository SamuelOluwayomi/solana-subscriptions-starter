# Tutorial: Gasless Transactions with Lazorkit Paymaster

This tutorial demonstrates how CadPay eliminates gas fees for users through Lazorkit's Paymaster service, allowing seamless subscription payments without requiring SOL.

## 🎯 What You'll Learn

- How Lazorkit's Paymaster sponsors transaction fees
- Implementing gasless token transfers
- Building a subscription payment flow
- Handling transaction signing with Smart Wallets
- Testing gasless transactions with 0 SOL balance

## 📚 Prerequisites

- Completed [Tutorial 1: Passkey Wallet](./TUTORIAL_PASSKEY_WALLET.md)
- Understanding of Solana transactions
- Basic knowledge of SPL tokens

## 🏗️ How Paymaster Works

```
User initiates payment → Transaction created → Lazorkit Paymaster
                                                      ↓
                                              Adds fee payment
                                                      ↓
                                              Signs as co-signer
                                                      ↓
                                          Transaction submitted
                                                      ↓
                                          User pays 0 SOL ✅
```

**Key Benefit:** Users never need to acquire SOL for gas fees!

## Step 1: Understanding the Architecture

### Traditional Solana Transaction
```typescript
// ❌ Requires user to hold SOL for fees
const transaction = new Transaction();
transaction.add(transferInstruction);
transaction.feePayer = userWallet.publicKey; // User pays
await sendTransaction(transaction);
```

### Lazorkit Gasless Transaction
```typescript
// ✅ Paymaster pays the fees
const transaction = new Transaction();
transaction.add(transferInstruction);
// No feePayer set - Lazorkit handles it
await signAndSendTransaction(transaction);
```

## Step 2: Setting Up Token Utilities

**File:** `src/utils/cadpayToken.ts`

### Creating Transfer Instructions

```typescript
import { 
    Connection, 
    PublicKey, 
    Transaction,
    TransactionInstruction 
} from '@solana/web3.js';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

function createTransferInstruction(
    source: PublicKey,      // User's token account
    destination: PublicKey, // Merchant's token account
    owner: PublicKey,       // User's Smart Wallet
    amount: number
): TransactionInstruction {
    const keys = [
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false } // Smart Wallet signs
    ];
    
    // Transfer instruction layout: [3, amount(u64)]
    const data = Buffer.alloc(9);
    data.writeUInt8(3, 0); // Instruction 3: Transfer
    
    const bigAmount = BigInt(amount);
    for (let i = 0; i < 8; i++) {
        data[1 + i] = Number((bigAmount >> BigInt(8 * i)) & BigInt(0xff));
    }
    
    return new TransactionInstruction({
        keys,
        programId: TOKEN_PROGRAM_ID,
        data
    });
}
```

## Step 3: Building the Subscription Flow

**File:** `src/components/subscriptions/SubscribeModal.tsx`

### Component Setup

```typescript
import { useLazorkit } from '@/hooks/useLazorkit';
import { Transaction } from '@solana/web3.js';

export default function SubscribeModal({ service }) {
    const { address, signAndSendTransaction } = useLazorkit();
    const [isProcessing, setIsProcessing] = useState(false);
```

### The Subscribe Function

```typescript
const handleSubscribe = async () => {
    if (!address || !signAndSendTransaction) {
        showToast('Please connect your wallet', 'error');
        return;
    }
    
    try {
        setIsProcessing(true);
        
        // 1. Get user and merchant token accounts
        const userTokenAccount = await findAssociatedTokenAddress(
            new PublicKey(address),
            CADPAY_MINT // USDC mint
        );
        
        const merchantTokenAccount = await findAssociatedTokenAddress(
            new PublicKey(MERCHANT_WALLET),
            CADPAY_MINT
        );
        
        // 2. Create transfer instruction
        const amount = service.price * 1_000_000; // Convert to token decimals
        const transferIx = createTransferInstruction(
            userTokenAccount,
            merchantTokenAccount,
            new PublicKey(address), // Smart Wallet as authority
            amount
        );
        
        // 3. Build transaction
        const transaction = new Transaction();
        transaction.add(transferIx);
        
        // 4. Sign and send (Paymaster sponsors fees)
        const signature = await signAndSendTransaction(transaction);
        
        console.log('✅ Transaction successful:', signature);
        showToast('Subscription activated!', 'success');
        
    } catch (error: any) {
        console.error('Subscription failed:', error);
        showToast(`Payment failed: ${error.message}`, 'error');
    } finally {
        setIsProcessing(false);
    }
};
```

**Key Points:**
- No `feePayer` specified - Paymaster handles it
- Smart Wallet (`address`) signs as token account owner
- Transaction goes through even with 0 SOL balance

## Step 4: The Gasless Demo Component

**File:** `src/components/demo/GaslessDemo.tsx`

### Proving Zero-Fee Transactions

```typescript
export default function GaslessDemo({ solBalance }: { solBalance: number }) {
    const { address, signAndSendTransaction } = useLazorkit();
    const [isTesting, setIsTesting] = useState(false);
    
    const testGaslessTransaction = async () => {
        try {
            setIsTesting(true);
            
            // Create a minimal transaction (transfer 0.001 USDC to self)
            const userTokenAccount = await findAssociatedTokenAddress(
                new PublicKey(address!),
                CADPAY_MINT
            );
            
            const transferIx = createTransferInstruction(
                userTokenAccount,
                userTokenAccount, // Send to self
                new PublicKey(address!),
                1000 // 0.001 USDC
            );
            
            const transaction = new Transaction();
            transaction.add(transferIx);
            
            // This works even with 0 SOL!
            const signature = await signAndSendTransaction(transaction);
            
            console.log('✅ Gasless transaction proof:', signature);
            showToast('Gasless transaction successful!', 'success');
            
        } catch (error: any) {
            showToast(`Test failed: ${error.message}`, 'error');
        } finally {
            setIsTesting(false);
        }
    };
    
    return (
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">
                Test Gasless Payments
            </h3>
            
            {/* Show current SOL balance */}
            <div className="mb-6 p-4 bg-black/40 rounded-xl">
                <p className="text-sm text-zinc-400">Current SOL Balance</p>
                <p className="text-3xl font-bold text-white">
                    {solBalance.toFixed(4)} SOL
                </p>
                {solBalance === 0 && (
                    <p className="text-xs text-green-400 mt-2">
                        ✅ Perfect! You can still transact with 0 SOL
                    </p>
                )}
            </div>
            
            <button
                onClick={testGaslessTransaction}
                disabled={isTesting}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl"
            >
                {isTesting ? 'Processing...' : 'Test Gasless Transaction'}
            </button>
        </div>
    );
}
```

## Step 5: Funding Wallets (Also Gasless!)

Even minting demo USDC is gasless:

```typescript
// USDC Faucet Component
const requestDemoUSDC = async () => {
    if (!address) return;
    
    try {
        setLoading(true);
        
        // Construct mint transaction on backend/helper
        const transaction = await constructMintTransaction(address, 50_000_000);
        
        // User signs, Paymaster pays fees
        const signature = await signAndSendTransaction(transaction);
        
        console.log('✅ Minted 50 USDC, gas paid by Paymaster:', signature);
        showToast('Received 50 USDC!', 'success');
        
    } catch (error: any) {
        showToast(`Faucet failed: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
};
```

## Step 6: Verifying Gasless Transactions

### Check Transaction on Explorer

```typescript
const verifyGasless = async (signature: string) => {
    const tx = await connection.getParsedTransaction(signature);
    
    if (!tx) {
        console.error('Transaction not found');
        return;
    }
    
    // Check fee payer
    const feePayer = tx.transaction.message.accountKeys[0].pubkey;
    console.log('Fee paid by:', feePayer.toBase58());
    console.log('User wallet:', address);
    console.log('Was gasless?', feePayer.toBase58() !== address);
    
    // Fee payer will be Lazorkit's Paymaster address
};
```

### Inspect on Solana Explorer

1. Copy transaction signature
2. Visit `https://explorer.solana.com/tx/${signature}?cluster=devnet`
3. Check "Fee Payer" field
4. Verify it's NOT your wallet address

## 🎨 Complete User Flow

### Subscription Payment Flow

1. **User browses services** (Netflix, Spotify, etc.)
2. **Clicks "Subscribe"**
3. **Modal appears** with price and details
4. **Confirms payment** (one click)
5. **Biometric prompt** for transaction signing
6. **User approves** with Face ID/Touch ID
7. **Transaction sent** - Paymaster pays fees
8. **Subscription activated** instantly

### Behind the Scenes

```
User Action: "Subscribe to Netflix"
        ↓
Create Transfer Instruction (USDC from user to merchant)
        ↓
Build Transaction
        ↓
Call signAndSendTransaction()
        ↓
Lazorkit SDK adds Paymaster as co-signer
        ↓
Paymaster adds fee payment instruction
        ↓
Transaction submitted to Solana
        ↓
✅ Success - User paid 0 SOL
```

## 🧪 Testing Checklist

- [ ] Create wallet with 0 SOL balance
- [ ] Mint demo USDC (transaction succeeds with 0 SOL)
- [ ] Subscribe to a service (payment goes through)
- [ ] Check SOL balance (still 0)
- [ ] Verify transaction on explorer (fee payer is Paymaster)
- [ ] Test multiple subscriptions in a row

## 🎯 Real-World Example

**Scenario:** User wants to subscribe to Netflix ($9.99/month)

```typescript
// User has:
// - Smart Wallet: 7aBc...xyz
// - SOL Balance: 0.000000 SOL
// - USDC Balance: 50.00 USDC

const subscribeToNetflix = async () => {
    const price = 9.99 * 1_000_000; // $9.99 in token units
    
    const transaction = new Transaction();
    transaction.add(
        createTransferInstruction(
            userUSDCAccount,
            netflixMerchantAccount,
            smartWalletPubkey,
            price
        )
    );
    
    // This succeeds even with 0 SOL!
    const sig = await signAndSendTransaction(transaction);
    
    // User's new balances:
    // - SOL: 0.000000 (unchanged!)
    // - USDC: 40.01 (paid $9.99)
};
```

## 🐛 Common Issues

### Transaction fails with "blockhash not found"
- **Cause:** Devnet congestion or old blockhash
- **Fix:** Lazorkit SDK handles this automatically, just retry

### "Insufficient balance" error
- **Cause:** Not enough USDC (not SOL!)
- **Fix:** Use the demo USDC faucet

### Transaction succeeds but SOL was deducted
- **Cause:** Using wrong transaction method
- **Fix:** Always use `signAndSendTransaction` from Lazorkit hook

## ✅ Key Takeaways

1. ✅ Paymaster eliminates all gas fees for users
2. ✅ Users can transact with 0 SOL balance
3. ✅ Same UX as traditional payments
4. ✅ Works for any on-chain operation (not just transfers)
5. ✅ No configuration needed - Lazorkit handles everything

## 🚀 Production Considerations

### Rate Limiting
Lazorkit Paymaster may have rate limits. For production:
- Implement transaction queuing
- Add retry logic with exponential backoff
- Monitor Paymaster service status

### Transaction Priority
For time-sensitive transactions:
- Use `commitment: 'confirmed'` for faster finality
- Consider priority fees for critical operations

### Error Handling
```typescript
try {
    const sig = await signAndSendTransaction(tx);
} catch (error) {
    if (error.message?.includes('Paymaster')) {
        // Paymaster service issue
        showToast('Service temporarily unavailable', 'error');
    } else if (error.message?.includes('Insufficient')) {
        // User lacks USDC
        showToast('Insufficient USDC balance', 'error');
    }
}
```

## 📚 Next Steps

- Explore session keys for automated recurring payments
- Implement transaction history tracking
- Build merchant analytics dashboard

## 🔗 References

- [Lazorkit Paymaster Documentation](https://docs.lazorkit.com/paymaster)
- [Solana Transaction Structure](https://docs.solana.com/developing/programming-model/transactions)
- [SPL Token Program](https://spl.solana.com/token)

---

**Congratulations!** You now understand how to build gasless blockchain applications that feel as smooth as traditional web apps. 🎉
