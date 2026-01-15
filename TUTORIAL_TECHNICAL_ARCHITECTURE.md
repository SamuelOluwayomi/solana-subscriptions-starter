# Technical Architecture Deep Dive

This document explains the technical flow of CadPay, from wallet creation to on-chain data storage.

## 1. The 3-Tier Architecture

CadPay operates across three distinct layers to provide a seamless Web2-like experience:

### A. Frontend (React + Lazor Kit)
- **Identity**: Uses WebAuthn (Passkeys) to create a secure keypair on the user's device.
- **Wallet**: Generates a **Program Derived Address (PDA)** on Solana.
- **Interaction**: Sends instructions to the Anchor program, sponsored by the Paymaster.

### B. Backend (Next.js API Routes)
- **Private Faucet (`/api/faucet`)**: 
    - Automatically detects new wallet connections.
    - Sends a one-time grant of **0.05 SOL** from the `TREASURY_SECRET_KEY`.
    - **Purpose**: Pays for Solana "Account Rent" so the user can store data on-chain.

### C. On-Chain (Anchor Program)
- **Profile Storage**: Creates a `UserProfile` account for the user.
- **Savings Pots**: Allows users to create locked savings accounts (PDAs) to store USDC securely.
- **Data Structures**:
  ```rust
  pub struct UserProfile {
      pub authority: Pubkey,
      pub username: [u8; 16],
      pub emoji: [u8; 4],
      pub gender: [u8; 8],
      pub pin: [u8; 4],
  }

  pub struct SavingsPot {
      pub authority: Pubkey,
      pub name: String,
      pub unlock_time: u64,
      pub balance: u64,
      pub created_at: u64,
      pub bump: u8,
  }
  ```

### D. Transaction Tagging (SPL Memo)
- **Context**: Every subscription payment includes an **SPL Memo** instruction.
- **Role**: This attaches a human-readable string (e.g., `"Subscribed to Netflix: Monthly"`) to the transaction on-chain.
- **Verification**: Merchants use these memos to verify *what* a user paid for without needing a separate database lookup for every tx.

## 2. Onboarding Lifecycle

1. **Phase 1: Key Generation**
   - User authenticates via Biometrics.
   - Lazor Kit creates a unique PDA for the user.
   - *Status: Wallet exists, but has 0 SOL.*

2. **Phase 2: The "Gas Bridge" (Faucet)**
   - Frontend calls `/api/faucet`.
   - Backend transfers 0.05 SOL to the new PDA.
   - *Status: User can now pay for account creation rent.*

3. **Phase 3: Smart Contract Initialization**
   - User enters their profile details.
   - Frontend sends `initialize_user` transaction.
   - Anchor program creates the `UserProfile` account on-chain.
   - *Status: Data is permanently stored on the Solana ledger.*

4. **Phase 4: Savings & Payments**
   - User creates a Savings Pot (USDC).
   - User deposits USDC into the pot (PDA).
   - User can withdraw USDC back to their wallet or pay merchants directly.
   - *Status: User has full control over their funds without needing to hold native SOL.*

## 3. Why This Matters
Traditional Solana apps fail because users need SOL for every account initialization (rent) and every transaction (fees). CadPay's 3-layer approach (Private Faucet + Paymasters + Savings Pots) ensures users only see USDC, while the underlying complexity is handled automatically.

---

**Resources:**
- [Passkey Wallet Tutorial](./TUTORIAL_PASSKEY_WALLET.md)
- [Gasless Transactions Tutorial](./TUTORIAL_GASLESS_TRANSACTIONS.md)
