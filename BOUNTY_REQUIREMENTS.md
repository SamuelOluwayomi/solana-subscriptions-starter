# Bounty Submission: Two Examples Explained

This document explains how CadPay meets the bounty requirement of providing **two distinct examples**: one integrating an existing protocol, and one original idea.

---

## Bounty Requirements

> Each submission must include at least two examples:
> 1. One example must interact with an **existing protocol** on Solana
> 2. One example can be based on your **own original idea**

✅ **CadPay provides both examples, fully functional on devnet.**

---

## Example 1: Jupiter DEX Integration

**Protocol Used:** [Jupiter Aggregator](https://jup.ag)

### What is Jupiter?

Jupiter is Solana's leading DEX aggregator, routing trades across multiple decentralized exchanges (Raydium, Orca, Serum, etc.) to find the best swap rates.

### Our Integration

**Feature:** **Auto-Swap Subscriptions**

Users can subscribe to automatically convert USDC → SOL monthly using Jupiter's API, with all transactions **gasless** via Lazorkit Paymaster.

### How It Works

```
User subscribes ($10/month USDC → SOL swap)
           ↓
Jupiter API fetches best route
           ↓
Transaction built with optimal path
           ↓
Lazorkit signs & sponsors gas fees
           ↓
SOL deposited to user wallet
```

### Try It Live

1. Visit [`/jupiter`](http://localhost:3000/jupiter)
2. Connect wallet (biometric auth)
3. Enter USDC amount (e.g., 10 USDC)
4. Click "Get Quote" - see best rate across all DEXs
5. Click "Swap (Gasless)" - execute transaction
6. Verify on [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet)

### Code Implementation

**Jupiter Quote Fetching:**
```typescript
// src/utils/jupiterSwap.ts
const quote = await getJupiterQuote(
    USDC_MINT_DEVNET.toString(),
    SOL_MINT.toString(),
    10_000_000, // 10 USDC
    50 // 0.5% slippage
);

// Returns: best route, expected output, price impact
```

**Gasless Execution:**
```typescript
// src/hooks/useJupiterSwap.ts
const signature = await executeJupiterSwap(
    connection,
    swapTransaction,
    signAndSendTransaction // Lazorkit handles gas sponsorship
);
```

### Documentation

- **Full Tutorial:** [TUTORIAL_JUPITER_INTEGRATION.md](./TUTORIAL_JUPITER_INTEGRATION.md)
- **Live Demo:** `/jupiter` page
- **Code:** `src/utils/jupiterSwap.ts`, `src/hooks/useJupiterSwap.ts`

---

## Example 2: CadPay Subscription Platform (Original Idea)

**Original Concept:** Netflix-style recurring crypto payments powered by Lazorkit Account Abstraction.

### The Problem

Traditional crypto payments require:
- ❌ Manual approval for every transaction
- ❌ Users to hold native tokens for gas
- ❌ Managing seed phrases (poor UX)
- ❌ Complex onboarding

### Our Solution

CadPay creates a **Web2-like subscription experience** on Web3 infrastructure:

✅ **Passkey Wallets** - No seed phrases, biometric login  
✅ **Gasless Transactions** - Never need SOL for fees  
✅ **Auto-Settlement** - Pre-approved recurring payments  
✅ **Instant Onboarding** - Face ID → wallet created  

### How It Works

**User Flow:**
```
1. Create Wallet (Face ID/Touch ID)
           ↓
2. Mint Test USDC (gasless)
           ↓
3. Subscribe to Netflix ($9.99/month)
           ↓
4. Transaction executes (gasless)
           ↓
5. Merchant receives payment instantly
```

**Merchant Flow:**
```
1. Log into Merchant Portal
           ↓
2. View live transactions
           ↓
3. See revenue analytics (MRR, ARR)
           ↓
4. Export customer data
```

### Try It Live

**As a Consumer:**
1. Visit `/create` - create passkey wallet
2. Go to `/dashboard` - mint test USDC
3. Browse services - subscribe to Netflix/Spotify/etc
4. View subscriptions - manage recurring payments

**As a Merchant:**
1. Visit `/merchant-auth`
2. Login: `Admin@gmail.com` / `admin`
3. See live transactions from subscribers
4. View analytics dashboard

### Code Implementation

**Passkey Wallet Creation:**
```typescript
// src/hooks/useLazorkit.ts
const { connect } = useWallet();

await connect(); // Triggers biometric prompt
// Wallet created and stored in device Secure Enclave
```

**Gasless Subscription Payment:**
```typescript
// Transaction built with subscription details
const transaction = new Transaction().add(
    transferChecked({
        source: userTokenAccount,
        destination: merchantTokenAccount,
        amount: subscriptionPrice,
        // ...
    })
);

// Lazorkit sponsors gas fees
await signAndSendTransaction(transaction);
```

**Recurring Billing Logic:**
```typescript
// src/hooks/useSubscriptions.ts
const addSubscription = (service) => {
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    
    return {
        ...service,
        startDate: new Date(),
        nextBilling, // Auto-calculated
    };
};
```

### Documentation

- **Passkey Wallet Tutorial:** [TUTORIAL_PASSKEY_WALLET.md](./TUTORIAL_PASSKEY_WALLET.md)
- **Gasless Transactions Tutorial:** [TUTORIAL_GASLESS_TRANSACTIONS.md](./TUTORIAL_GASLESS_TRANSACTIONS.md)
- **Live Demo:** Main application (`/`, `/dashboard`, `/merchant`)
- **Code:** `src/hooks/useLazorkit.ts`, `src/hooks/useSubscriptions.ts`

---

## Comparison Table

| Aspect | Example 1: Jupiter | Example 2: CadPay |
|--------|-------------------|-------------------|
| **Type** | Existing Protocol | Original Idea |
| **Protocol** | Jupiter DEX Aggregator | Lazorkit AA SDK |
| **Use Case** | Auto-swap subscriptions | Recurring payments |
| **Complexity** | DEX integration | Full payment platform |
| **Demo Page** | `/jupiter` | `/`, `/dashboard`, `/merchant` |
| **Gasless** | ✅ Yes | ✅ Yes |
| **Smart Contract** | Jupiter program | SPL Token transfers |
| **User Flow** | Swap tokens | Subscribe & pay |

---

## Technical Highlights

### Both Examples Share:

1. **Lazorkit Paymaster** - All transactions are gasless
2. **Passkey Authentication** - No seed phrases required
3. **Devnet Deployment** - Safe testing environment
4. **Modern UX** - Web2-like experience

### Unique to Each:

**Jupiter Integration:**
- Multi-DEX routing
- Real-time quote fetching
- Slippage protection
- Cross-protocol liquidity

**CadPay Platform:**
- Subscription management
- Merchant dashboard
- Analytics & reporting
- Session persistence

---

## Verification for Judges

### Test Example 1 (Jupiter)

```bash
1. Visit /jupiter
2. Create wallet (biometric)
3. Mint 100 devnet USDC
4. Swap 10 USDC → SOL
5. Verify transaction on Solana Explorer (devnet)
6. Confirm SOL balance increased, USDC decreased
7. Verify gas fee = 0 SOL (gasless)
```

### Test Example 2 (CadPay)

```bash
1. Visit /create
2. Create wallet (biometric)
3. Go to /dashboard
4. Mint 100 devnet USDC
5. Subscribe to Netflix ($9.99)
6. Visit /merchant-auth (Admin@gmail.com / admin)
7. See your transaction in merchant portal
8. Verify gasless transaction
```

---

## Why These Examples?

### Example 1: Jupiter (Ecosystem Integration)

Shows we can **integrate with Solana's DeFi ecosystem**:
- Uses industry-standard protocol (Jupiter)
- Demonstrates interoperability
- Leverages existing liquidity
- Real-world use case (auto-DCA, auto-rebalancing)

### Example 2: CadPay (Innovation)

Shows we can **build novel Web3 UX**:
- Solves real user pain points (seed phrases, gas fees)
- New use case for crypto (subscriptions)
- Merchant-focused (B2B opportunity)
- Production-ready architecture

Together, they demonstrate both **integration capability** and **original innovation**.

---

## Repository Structure

```
solana-subscriptions-starter/
├── src/
│   ├── app/
│   │   ├── jupiter/page.tsx          # Example 1: Jupiter demo
│   │   ├── dashboard/page.tsx        # Example 2: User dashboard
│   │   └── merchant/page.tsx         # Example 2: Merchant portal
│   ├── components/
│   │   └── jupiter/                  # Example 1: Jupiter UI
│   ├── hooks/
│   │   ├── useJupiterSwap.ts         # Example 1: Jupiter logic
│   │   └── useSubscriptions.ts       # Example 2: Subscription logic
│   └── utils/
│       └── jupiterSwap.ts            # Example 1: Jupiter utilities
├── TUTORIAL_JUPITER_INTEGRATION.md   # Example 1: Full guide
├── TUTORIAL_PASSKEY_WALLET.md        # Example 2: Wallet guide
├── TUTORIAL_GASLESS_TRANSACTIONS.md  # Example 2: Gasless guide
└── TUTORIAL_DEVNET_DEPLOYMENT.md      # Deployment guide
```

---

## Resources

### Example 1: Jupiter
- [Jupiter API Docs](https://station.jup.ag/docs/apis/swap-api)
- [Jupiter Integration Tutorial](./TUTORIAL_JUPITER_INTEGRATION.md)
- [Live Demo: /jupiter](/jupiter)

### Example 2: CadPay
- [Passkey Wallet Tutorial](./TUTORIAL_PASSKEY_WALLET.md)
- [Gasless Transactions Tutorial](./TUTORIAL_GASLESS_TRANSACTIONS.md)
- [Live Demo: Main App](/)

### General
- [Devnet Deployment Guide](./TUTORIAL_DEVNET_DEPLOYMENT.md)
- [Lazorkit Docs](https://docs.lazorkit.com)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)

---

## Questions?

Both examples are fully functional on devnet. Test them at:
- **Jupiter Swap:** `https://your-deployment.vercel.app/jupiter`
- **CadPay Platform:** `https://your-deployment.vercel.app`

All code is documented, tested, and ready for review! 🚀
