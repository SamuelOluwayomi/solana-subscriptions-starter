# SPL Memo Protocol Integration

## Overview

This project demonstrates **protocol integration** by using the **SPL Memo Program** - a standard Solana protocol that attaches text notes to transactions.

**Why SPL Memo?**
- ✅ Standard Solana protocol (exists on devnet)
- ✅ Demonstrates interaction with existing on-chain programs
- ✅ Simple, reliable, and widely used
- ✅ Works with gasless transactions via Lazorkit

> **Note:** Jupiter DEX aggregator is mainnet-only and cannot be used for devnet demo projects. SPL Memo is the ideal alternative for demonstrating protocol integration on devnet.

---

## How It Works

### The SPL Memo Program

- **Program ID:** `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- **Purpose:** Attaches UTF-8 text messages to Solana transactions
- **Use Cases:** Transaction notes, payment descriptions, metadata

### CadPay Integration

Every subscription payment transaction includes a memo instruction that:
1. Identifies the payment as coming from CadPay
2. Can include subscription details (service name, plan, etc.)
3. Makes transactions searchable and more transparent on-chain

---

## Implementation

### 1. Install SPL Memo

```bash
npm install @solana/spl-memo
```

### 2. Create Memo Utility

File: `src/utils/memoProtocol.ts`

```typescript
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';

export function createSubscriptionMemoInstruction(
    message: string,
    signerPubkey: PublicKey
): TransactionInstruction {
    return createMemoInstruction(message, [signerPubkey]);
}
```

### 3. Add Memo to Payment Transactions

When building a subscription payment transaction:

```typescript
import { createSubscriptionMemoInstruction } from '@/utils/memoProtocol';

// 1. Create the memo instruction
const memoInstruction = createSubscriptionMemoInstruction(
    `CadPay: ${serviceName} - ${planName}`,
    userPublicKey
);

// 2. Create the payment transfer instruction
const transferInstruction = createTransferCheckedInstruction(
    fromTokenAccount,
    usdcMint,
    toTokenAccount,
    userPublicKey,
    amount,
    6 // USDC decimals
);

// 3. Add both to the transaction (memo first!)
transaction.add(memoInstruction);
transaction.add(transferInstruction);

// 4. Sign and send (gasless via Lazorkit)
await signAndSendTransaction(transaction);
```

---

## Verification

### View Memo on Solana Explorer

1. Complete a subscription payment
2. Copy the transaction signature
3. Visit: `https://explorer.solana.com/tx/{signature}?cluster=devnet`
4. Look for the "Memo" instruction in the transaction details

**Example:**
```
Instruction #1: Memo Program
Message: "CadPay: Netflix - Premium Plan"
```

### Code Location

- **Utility:** `src/utils/memoProtocol.ts`
- **Usage:** Subscription payment flows
- **Documentation:** This file

---

## Bounty Requirement: Protocol Integration ✅

**Requirement:** "Interact with an existing protocol"

**How CadPay Meets This:**
- ✅ Integrates with **SPL Memo Program** (standard Solana protocol)
- ✅ Every payment transaction calls the Memo program
- ✅ Demonstrable on devnet via Solana Explorer
- ✅ Adds value: transaction transparency and searchability

---

## Benefits

1. **Transaction Transparency:** Users can see payment descriptions on-chain
2. **Searchability:** Filter transactions by memo content
3. **Auditing:** Easier for merchants to track subscription payments
4. **Protocol Interaction:** Demonstrates ability to integrate with Solana programs
5. **Future Extensibility:** Can add more metadata (dates, IDs, etc.)

---

## Alternative Protocols Considered

| Protocol | Works on Devnet? | Complexity | Decision |
|----------|-----------------|------------|----------|
| Jupiter DEX | ❌ No (mainnet-only) | High | Not viable |
| Metaplex | ✅ Yes | High | Overkill for subscriptions |
| SPL Memo | ✅ Yes | Low | **Perfect fit** ✅ |
| SPL Token | ✅ Yes (already using) | Medium | Already integrated |

---

## Resources

- **SPL Memo Docs:** [solana.com/docs/programs/memo](https://solana.com/docs/programs/memo)
- **Program Explorer:** [explorer.solana.com/address/MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr](https://explorer.solana.com/address/MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr?cluster=devnet)
- **Source Code:** `@solana/spl-memo` on npm

---

## Summary

CadPay demonstrates **protocol integration** by incorporating the **SPL Memo Program** into every subscription payment. This standard Solana protocol adds transaction metadata, enabling transparency and searchability while fulfilling the bounty requirement to interact with existing on-chain programs.

---

## 🌐 Project Links

- **Live Demo:** [https://cadpay.vercel.app/](https://cadpay.vercel.app/)
- **GitHub Repository:** [https://github.com/SamuelOluwayomi/solana-subscriptions-starter](https://github.com/SamuelOluwayomi/solana-subscriptions-starter)
- **Watch the Demo:** [Demo Video Coming Soon]

**Next:** Learn about [Developing for Devnet →](./TUTORIAL_DEVNET_DEPLOYMENT.md)
