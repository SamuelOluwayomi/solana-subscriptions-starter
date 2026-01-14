# CadPay - Next-Gen Subscriptions on Solana

> **Lazorkit Passkey Integration** - Subscription payments made gasless, passwordless, and seamless.

CadPay is a subscription payment platform built on Solana that leverages **Lazorkit's Account Abstraction** to deliver a Web2-like UX with Web3 security. Users can create wallets with biometrics (no seed phrases), subscribe to services, and pay—all without holding SOL for gas fees.

## 🎯 Project Overview

CadPay demonstrates the power of Lazorkit SDK by solving two major crypto UX problems:
1. **Wallet Onboarding** - Passkey-based authentication eliminates seed phrases
2. **Gas Fees** - Paymaster service sponsors all transaction costs

**Key Features:**
- 🔐 **Passkey Wallets** - Biometric login (Face ID, Touch ID, Windows Hello)
- ⚡ **Gasless Transactions** - Users never need SOL for fees
- 💳 **Subscription Management** - Netflix, Spotify, and custom services
- 📊 **Merchant Dashboard** - Live transaction tracking and analytics
- 🔄 **Session Persistence** - Seamless cross-device experience
- 🌟 **Jupiter DEX Integration** - Auto-swap subscriptions with best rates

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Blockchain:** Solana (Devnet)
- **Account Abstraction:** Lazorkit SDK v2.0.1
- **Wallet:** `@lazorkit/wallet` with Passkey integration
- **DEX Integration:** Jupiter Aggregator API
- **Payments:** USDC token transfers
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern browser with WebAuthn support (Chrome, Safari, Edge)
- Device with biometric authentication (or PIN as fallback)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/SamuelOluwayomi/solana-subscriptions-starter
cd solana-subscriptions-starter
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Lazorkit Configuration
NEXT_PUBLIC_LAZORKIT_APP_ID=your_app_id_here
NEXT_PUBLIC_LAZORKIT_PUBLIC_KEY=your_public_key_here

# Solana Network (Devnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Recommended: use a managed RPC endpoint for stability under load. Create a `.env.local` from `.env.local.example` and set:

```env
# Example managed RPC (QuickNode / Alchemy)
NEXT_PUBLIC_RPC_URL=https://your-quicknode-endpoint.solana-devnet.quiknode.pro/abcd1234/
```

Debugging tip: if you want to bypass Lazorkit's Paymaster and send transactions directly (useful when validating on-chain state during development), set:

```env
# Disable Lazorkit Paymaster for debugging
NEXT_PUBLIC_DISABLE_PAYMASTER=true
```

**Note:** Get your Lazorkit credentials from [Lazorkit Dashboard](https://lazorkit.io)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 🏆 Bounty Submission: Two Examples

This project demonstrates **two distinct integration examples** to meet bounty requirements:

### Example 1: Jupiter DEX Integration (Existing Protocol)
- **Protocol:** Jupiter Aggregator - Solana's leading DEX aggregator
- **Feature:** Auto-swap subscriptions (USDC → SOL)
- **Demo Page:** `/jupiter`
- **Highlights:**
  - Fetches best swap rates across all Solana DEXs
  - Executes gasless swaps via Lazorkit
  - Live quote display with slippage protection
  - Transaction history with Explorer links

### Example 2: CadPay Platform (Original Idea)
- **Concept:** Netflix-style recurring crypto payments
- **Features:** Passkey wallets, gasless transactions, auto-settlement
- **Demo Pages:** `/`, `/dashboard`, `/merchant`
- **Highlights:**
  - Biometric authentication (no seed phrases)
  - Subscription management for 10+ services
  - Merchant analytics dashboard
  - Real-time payment tracking

**Learn More:** [Bounty Requirements Explained](./BOUNTY_REQUIREMENTS.md)

---

## 📚 Tutorials

Comprehensive step-by-step guides for developers and judges:

1. **[Bounty Requirements](./BOUNTY_REQUIREMENTS.md)** - Overview of both examples
2. **[Jupiter DEX Integration](./TUTORIAL_JUPITER_INTEGRATION.md)** - Build auto-swap subscriptions
3. **[Creating a Passkey Wallet](./TUTORIAL_PASSKEY_WALLET.md)** - Biometric authentication guide
4. **[Gasless Transactions](./TUTORIAL_GASLESS_TRANSACTIONS.md)** - How Paymaster works
5. **[Devnet Deployment Guide](./TUTORIAL_DEVNET_DEPLOYMENT.md)** - Deploy & test on Solana devnet

## 🎮 User Flow

### For Subscribers:
1. Visit homepage and click "Create Wallet"
2. Authenticate with biometrics (passkey created in Secure Enclave)
3. Fund wallet with demo USDC (gasless mint transaction)
4. Browse services and subscribe (all fees sponsored by Paymaster)
5. Manage subscriptions from dashboard

### For Merchants:
1. Navigate to Merchant Portal
2. Login with credentials (Admin@gmail.com / admin)
3. View live transactions from subscribers
4. Monitor revenue, MRR, and customer analytics
5. Access developer API keys

## 🔑 Key Lazorkit Integrations

### Passkey Authentication
```typescript
import { useWallet } from '@lazorkit/wallet';

const { connect, smartWalletPubkey } = useWallet();

// Create/Login with biometrics
await connect();
```

### Gasless Transaction Signing
```typescript
const { signAndSendTransaction } = useWallet();

// Transaction is sponsored by Paymaster
const signature = await signAndSendTransaction(transaction);
```

### Smart Wallet PDA
```typescript
// User's Smart Wallet address (not the passkey)
const walletAddress = smartWalletPubkey?.toBase58();
```

## 📁 Project Structure

```
src/
├── app/              # Next.js pages
│   ├── create/       # Passkey wallet creation
│   ├── signin/       # Biometric login
│   ├── dashboard/    # User subscription dashboard
│   └── merchant/     # Merchant analytics portal
├── components/       # Reusable UI components
├── hooks/           
│   └── useLazorkit.ts   # Main Lazorkit hook wrapper
├── context/          # React context providers
├── utils/            # Token utilities and helpers
└── data/             # Mock subscription services

```

## 🧪 Testing on Devnet

1. **Create a wallet** at `/create`
2. **Request demo USDC** from the dashboard (gasless mint)
3. **Subscribe to a service** - transaction is sponsored
4. **Check merchant portal** - see your transaction appear live
5. **Verify 0 SOL balance** - confirm all transactions were gasless

## 🌐 Live Demo

**Deployed URL:** https://cadpay.vercel.app/

## 🐦 Connect on X

**Stay updated:** [Follow the project on X](https://x.com/The_devsam/status/2009888166329647558)

## 🏆 Hackathon Submission

This project was built for the **Lazorkit Passkey Integration Bounty** by Superteam Vietnam.

**Requirements Met:**
- ✅ Working Lazorkit SDK integration
- ✅ Passkey-based wallet creation and login
- ✅ Gasless transactions via Paymaster
- ✅ Clean, documented codebase
- ✅ 2+ step-by-step tutorials
- ✅ Live demo on Devnet

## 🤝 Contributing

This is a hackathon submission, but feel free to fork and build upon it!


## 🙏 Acknowledgments

- **Lazorkit** for the amazing SDK and Paymaster service
- **Superteam Vietnam** for organizing the bounty
- **Solana Foundation** for the robust blockchain infrastructure
