# Gasless Transactions Tutorial

## What are Gasless Transactions?

In traditional blockchain applications, users must pay "gas fees" for every transaction. **CadPay eliminates this barrier** by sponsoring gas fees for all customer transactions, making Web3 feel like Web2.

## Why Gasless Matters

### Traditional Web3 UX Problems
❌ Users need native tokens (SOL, ETH) before they can transact  
❌ Users must understand gas fees and network congestion  
❌ Failed transactions still cost gas  
❌ Friction in onboarding new users  

### CadPay's Solution
✅ **Zero gas fees** for customers  
✅ **Instant onboarding** - no SOL required  
✅ **Merchant sponsors** all transaction costs  
✅ **Frictionless UX** like traditional apps  

## How It Works

### Architecture

```
Customer Signs Transaction (0 SOL needed)
         ↓
Lazorkit Wallet Relayer
         ↓
Merchant/Paymaster Pays Gas
         ↓
Transaction Executed on Solana
         ↓
Customer Subscription Activated
```

### The "First Transaction" Problem
On Solana, every new account (like a `UserProfile` or a Token Account) requires a small amount of SOL to be "Rent Exempt". Even if a Paymaster sponsors the transaction fees, someone must pay the **Account Rent**.

**CadPay's Private Faucet** solves this by sending a one-time grant of **0.05 SOL** to every new smart wallet. This is enough to:
1. Initialize the `UserProfile` account (~0.002 SOL)
2. Create the USDC Token Account (~0.002 SOL)
3. Pay for several independent transactions if the Paymaster is ever offline.

### Gas Cost Breakdown
On Solana, typical transaction costs are **~0.000005 SOL** ($0.0001 at $20/SOL). CadPay merchants absorb this cost to provide seamless UX.

## Implementation

### Customer Transaction (Gasless)
```typescript
// Customer DOESN'T need SOL in their wallet
const transaction = await transferUSDC({
  from: userWallet,
  to: merchantWallet,
  amount: subscriptionPrice
});

// Lazorkit handles gas sponsorship automatically
const signature = await signAndSendTransaction(transaction);
```

### Merchant Dashboard Shows Savings
```typescript
// Calculate total gas subsidized
const totalGasSaved = transactionCount * 0.000005; // SOL
// Display: "You saved users ${totalGasSaved.toFixed(4)} SOL"
```

### Behind the Scenes

1. **User Creates Wallet**: Private Faucet detects the new address and sends 0.05 SOL.
2. **User Onboards**: The 0.05 SOL covers the "Rent" for the `UserProfile` data storage.
3. **Subscribing**: When paying, Lazorkit wraps the instruction. The Paymaster pays the ~0.000005 SOL fee.
4. **Outcome**: The user never sees a "Insufficient SOL" error.

## Setting Up Gasless Payments

### 1. Configure Merchant Wallet
Ensure your merchant wallet has sufficient SOL for gas:
```typescript
const merchantBalance = await connection.getBalance(merchantPubkey);
const minRequired = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL buffer

if (merchantBalance < minRequired) {
  await requestAirdrop(merchantPubkey, 1 * LAMPORTS_PER_SOL);
}
```

### 2. Create Token Transfer Transaction
```typescript
import { transferChecked } from '@solana/spl-token';

const transaction = new Transaction().add(
  transferChecked({
    source: customerTokenAccount,
    mint: CADPAY_MINT,
    destination: merchantTokenAccount,
    owner: customerPubkey,
    amount: amountInLamports,
    decimals: 6
  })
);
```

### 3. Sponsor via Lazorkit
The Lazorkit SDK automatically handles gas sponsorship - no additional code needed!

## Cost Analysis

### Monthly Costs (Example)
- **100 customers** × **1 transaction/customer** = 100 transactions
- Gas cost: `100 × 0.000005 SOL = 0.0005 SOL`
- At $20/SOL: **$0.01/month**

### Comparison
| Platform | Customer Gas Fee | Merchant Gas Fee |
|----------|-----------------|------------------|
| Traditional DeFi | ✅ Required | ❌ None |
| **CadPay** | ✅ **$0.00** | ✅ **$0.01/100 tx** |

## Benefits for Merchants

1. **Lower barrier to entry** - customers don't need crypto
2. **Higher conversion rates** - no gas fee friction
3. **Competitive advantage** - Web2-like UX in Web3
4. **Minimal cost** - Solana fees are negligible
5. **Marketing opportunity** - "We pay the gas!"

## Monitoring Gas Usage

Track in merchant dashboard:
```typescript
const [gasSaved, setGasSaved] = useState(0);

useEffect(() => {
  const totalGas = transactions.length * 0.000005;
  setGasSaved(totalGas);
}, [transactions]);

// Display: "Gas Subsidized (The Flex): 0.0042 SOL"
```

## Advanced: Custom Gas Logic

Want to limit gas sponsorship?
```typescript
// Only sponsor for subscriptions > $10
if (subscriptionPrice >= 10) {
  await signAndSendTransaction(transaction); // Gasless
} else {
  // Require customer to pay gas
  await window.solana.signAndSendTransaction(transaction);
}
```

## Troubleshooting

### "Insufficient funds for transaction"
The **merchant** wallet needs SOL, not the customer. Check:
```typescript
const merchantBalance = await connection.getBalance(merchantPubkey);
console.log(`Merchant has ${merchantBalance / LAMPORTS_PER_SOL} SOL`);
```

### Transaction fails silently
Enable error logging:
```typescript
try {
  const sig = await signAndSendTransaction(tx);
} catch (error) {
  console.error('Gas sponsorship failed:', error);
  // Fallback: ask user to pay gas
}
```

## Best Practices

1. ✅ **Monitor merchant SOL balance** regularly
2. ✅ **Set up auto-refill** when balance drops below threshold
3. ✅ **Track gas costs** per transaction type
4. ✅ **Communicate value** to customers ("We pay your fees!")
5. ✅ **Have fallback** for when sponsorship fails

## Resources
- [Solana Transaction Fees](https://docs.solana.com/transaction_fees)
- [Lazorkit Gasless SDK](https://docs.lazorkit.com/)
- [SPL Token Program](https://spl.solana.com/token)

---

---

## 🌐 Project Links

- **Live Demo:** [https://cadpay.vercel.app/](https://cadpay.vercel.app/)
- **GitHub Repository:** [https://github.com/SamuelOluwayomi/solana-subscriptions-starter](https://github.com/SamuelOluwayomi/solana-subscriptions-starter)
- **Watch the Demo:** [Demo Video Coming Soon]

**Previous:** [← Passkey Wallet Tutorial](./TUTORIAL_PASSKEY_WALLET.md)
