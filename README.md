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

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Blockchain:** Solana (Devnet)
- **Account Abstraction:** Lazorkit SDK v2.0.1
- **Wallet:** `@lazorkit/wallet` with Passkey integration
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
git clone <your-repo-url>
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

## 📚 Tutorials

We've created comprehensive step-by-step guides to help you understand the Lazorkit integration:

1. **[Creating a Passkey Wallet](./docs/TUTORIAL_PASSKEY_WALLET.md)** - Learn how to onboard users with biometric authentication
2. **[Gasless Transactions with Paymaster](./docs/TUTORIAL_GASLESS_TRANSACTIONS.md)** - Understand how to sponsor transaction fees

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

**Deployed URL:** [Your Vercel/Netlify URL Here]

## 🎥 Demo Video

[Link to video walkthrough - coming soon]

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

## 📄 License

MIT

## 🙏 Acknowledgments

- **Lazorkit** for the amazing SDK and Paymaster service
- **Superteam Vietnam** for organizing the bounty
- **Solana Foundation** for the robust blockchain infrastructure
