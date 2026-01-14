# Contributing to CadPay Profiles Scaffold 🚀

First off, thank you for considering contributing to this scaffold! This project is designed to help Solana developers jumpstart their applications with optimized profile systems and automated onboarding.

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18 or later)
- Solana CLI
- Anchor CLI
- A Devnet wallet with some SOL (for the Treasury)

### 2. Local Setup
1. Fork the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/SamuelOluwayomi/solana-subscriptions-starter.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Setup your environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
5. Add your `TREASURY_SECRET_KEY` (Base58 or Byte Array) from your wallet to `.env.local` to enable the automated faucet.

### 3. Development Workflow
Always follow this workflow to maintain code quality:

1. **Create a Feature Branch**: Always branch off `main`.
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
2. **Commit Changes**: Use descriptive commit messages.
3. **Push & PR**: Push your branch and open a Pull Request. Even if you are working solo, PRs help document the "why" behind changes.

## 🏗️ Architecture Notes
- **Fixed-Size Buffers**: We use `[u8; 16]` and similar fixed arrays in Rust to keep transaction sizes under the 1232-byte limit for Smart Wallet compatibility.
- **Private Faucet**: Our `/api/faucet` route ensures reliable devnet onboarding without relying on public rate-limited faucets.

## ⚖️ Rules
- Do not commit your `.env.local` or any private keys.
- Ensure all Anchor tests pass before submitting a PR (if applicable).
- Keep the UI clean and follow the existing Tailwind styling.

Built with ❤️ for the Solana community.
