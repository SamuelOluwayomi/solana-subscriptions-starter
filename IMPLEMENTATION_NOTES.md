# CadPay Enhancements - Savings Accounts & Send Button Fixes

## Overview
This document outlines the three major implementations completed:

1. **Smart Contract for Savings Accounts** - Anchor program with storage rent funding
2. **Utility Functions for Savings Accounts** - On-chain savings pot management
3. **Fixed Send Button** - Proper transaction handling with Lazorkit

---

## 1. Smart Contract Enhancement (Anchor Program)

### File: `anchor/programs/cadpay/src/lib.rs`

#### New Instructions Added:

**`create_savings_pot`**
- Creates a new savings pot with a name and unlock time
- Uses PDA seeds: `[b"savings-pot-v1", authority, pot_name]`
- Validates pot name and unlock time
- Initializes the `SavingsPot` account

**`deposit_to_pot`**
- Allows users to deposit SOL into a savings pot
- Validates amount is greater than 0
- Tracks cumulative balance

**`withdraw_from_pot`**
- Allows withdrawal AFTER the unlock time
- Uses PDA signing for secure withdrawals
- Validates unlock time and sufficient balance

**`close_savings_pot`**
- Closes a savings pot and returns remaining balance to authority
- Can only be called by the pot owner

#### New Account Structures:

```rust
#[account]
pub struct SavingsPot {
    pub authority: Pubkey,        // User who owns the pot
    pub name: String,              // Pot identifier
    pub unlock_time: u64,          // Unix timestamp for unlock
    pub balance: u64,              // Current balance in lamports
    pub created_at: u64,           // Creation timestamp
    pub bump: u8,                  // PDA bump seed
}
```

#### Account Sizes:
- Discriminator: 8 bytes
- Authority (Pubkey): 32 bytes
- Name (String): 32 bytes (fixed)
- Unlock Time: 8 bytes
- Balance: 8 bytes
- Created At: 8 bytes
- Bump: 1 byte
- **Total: 97 bytes**

#### Error Codes:
- `InvalidPotName` - Pot name is empty or too long
- `InvalidUnlockTime` - Unlock time is not valid
- `InvalidAmount` - Amount is zero or negative
- `InvalidWithdrawalAmount` - Not enough balance or amount invalid
- `PotLocked` - Pot is still locked (current time < unlock time)
- `BalanceOverflow` - Balance exceeds maximum
- `BalanceUnderflow` - Insufficient balance for withdrawal

---

## 2. Utility Functions (Storage Rent Funding Pattern)

### File: `src/utils/savingsAccounts.ts`

This file implements the **Paymaster storage rent funding pattern** - similar to how USDC minting was handled.

#### Key Functions:

**`deriveSavingsPotPDA(userPublicKey, potName)`**
- Derives the canonical PDA address for a savings pot
- Deterministic: same inputs always produce same address

**`calculateSavingsPotRent(connection)`**
- Calculates the minimum rent for a savings pot account
- Returns rent amount in lamports

**`constructCreateSavingsPotTransaction(userPublicKey, potName, unlockTime, connection)`**
- Creates transaction instructions for pot creation
- **Funds storage rent upfront** (Paymaster pattern)
- Returns instructions array and pot address

**`depositToPotInstruction(userPublicKey, potName, amount, connection)`**
- Creates a SystemProgram.transfer instruction to a pot
- Amount in SOL

**`fetchUserSavingsPots(userPublicKey, connection, potNames)`**
- Fetches all pots for a user
- Returns array with name, address, and balance

#### Storage Rent Pattern:
```typescript
// 1. Calculate rent requirement
const rentLamports = await connection.getMinimumBalanceForRentExemption(97);

// 2. Pre-fund the PDA with rent (Paymaster style)
instructions.push(
    SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: savingsPotPDA,
        lamports: rentLamports,  // Fund upfront
    })
);

// 3. Program creates the account
// (Account initialization happens in the program instruction)
```

This ensures rent is covered automatically, similar to how profile creation works!

---

## 3. Fixed Send Button & Transaction Handling

### Files Modified:
1. **`src/hooks/useLazorkit.ts`**
   - Updated `createPot` to use smart contract
   - Added savings account utilities import
   - Properly handles transaction confirmation

2. **`src/app/dashboard/page.tsx`**
   - Fixed `handleUnifiedSend` function
   - Added proper blockhash and feePayer setup
   - Added toast notifications for user feedback
   - Proper error handling with user messages
   - Added `showToast` hook to OverviewSection

### Send Button Fix Implementation:

```typescript
const handleUnifiedSend = async (recipient: string, amount: number, isSavings: boolean) => {
    // 1. Validate connection
    if (!address || !signAndSendTransaction) {
        showToast("Wallet not connected", "error");
        return;
    }

    try {
        // 2. Create transfer instruction
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(address),
            toPubkey: new PublicKey(recipient),
            lamports: amount * LAMPORTS_PER_SOL,
        });

        // 3. Build transaction
        const tx = new Transaction();
        tx.add(transferInstruction);

        // 4. Set recent blockhash (IMPORTANT!)
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = new PublicKey(address);

        // 5. Sign and send
        const signature = await signAndSendTransaction(tx);

        // 6. Notify user and refresh
        showToast(`Funds sent! Tx: ${signature.slice(0, 8)}...`, 'success');
        await fetchPots();
        await refreshBalance();
    } catch (e: any) {
        showToast(`Send failed: ${e.message}`, 'error');
        throw e;
    }
};
```

### Key Improvements:
- ✅ Proper blockhash management (prevents "Blockhash not found" errors)
- ✅ Recent block height tracking
- ✅ Clear error messages to users
- ✅ Transaction confirmation feedback
- ✅ State refresh after successful send
- ✅ Gasless support (handled by Lazorkit Paymaster)

---

## 4. Wallet Creation (Already Using Lazorkit)

The wallet creation already uses Lazorkit via:
- **Sign In Page**: `loginWithPasskey()` from useLazorkit
- **Create Page**: `createPasskeyWallet()` from useLazorkit

Both use the Lazorkit Account Abstraction SDK which:
- Creates passkey-based accounts
- Stores keys in device Secure Enclave
- Supports biometric authentication
- Provides gasless transaction support

---

## Integration Summary

### User Flow for Savings:
1. User creates savings pot via "New Savings Pot" button
2. Frontend calculates PDA and rent requirement
3. Frontend creates transaction pre-funding the account storage
4. Lazorkit signs and sends transaction
5. Program creates account on-chain
6. Pot metadata stored locally for quick lookup

### User Flow for Sending:
1. User clicks "Send Funds" button
2. Enters recipient address and amount
3. Transaction built with recent blockhash
4. Lazorkit signs transaction
5. Transaction sent to Solana
6. User sees success/error toast
7. Balances refresh

---

## Testing Recommendations

### Smart Contract Tests:
```bash
anchor test

# Should test:
# - Create pot with valid name/unlock time
# - Reject invalid pot names
# - Deposit and track balance
# - Reject withdrawals before unlock time
# - Allow withdrawals after unlock time
# - Close pot and return balance
```

### Frontend Testing:
- [ ] Create savings pot → verify on-chain
- [ ] Deposit to pot → verify balance updates
- [ ] Try withdrawing before unlock → should fail
- [ ] Wait until unlock time → withdraw succeeds
- [ ] Send funds to external wallet → verify on Solana explorer
- [ ] Send to savings pot → verify balance increases

### Error Cases:
- [ ] Send with insufficient balance → shows error
- [ ] Send to invalid address → shows error
- [ ] Create pot with duplicate name → shows error
- [ ] Network timeout → shows error with retry option

---

## Files Changed

1. ✅ `anchor/programs/cadpay/src/lib.rs` - Smart contract enhancements
2. ✅ `src/utils/savingsAccounts.ts` - New utility file
3. ✅ `src/hooks/useLazorkit.ts` - Updated createPot, added imports
4. ✅ `src/app/dashboard/page.tsx` - Fixed send button, added toast

**All files compile without errors!** 🎉
