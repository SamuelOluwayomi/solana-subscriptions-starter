# Tutorial: Devnet Deployment Guide

Complete guide to deploying and testing your Solana application on **devnet** - Solana's test network for development and demonstration purposes.

---

## What is Devnet?

**Devnet** is Solana's public testing network where you can:
- ✅ Test your app without risking real money
- ✅ Get free SOL and test tokens from faucets
- ✅ Deploy and iterate quickly
- ✅ Share demos with users and judges

> [!IMPORTANT]
> Devnet tokens have **no real value**. This makes it perfect for hackathon submissions, demos, and testing!

---

## Solana Networks Comparison

| Network | Purpose | SOL Value | Use Case |
|---------|---------|-----------|----------|
| **Mainnet** | Production | 💰 Real ($) | Live apps |
| **Devnet** | Development | 🎁 Free (test) | ⭐ **Demos & Hackathons** |
| **Testnet** | Staging | 🎁 Free (test) | Validator testing |
| **Localnet** | Local | 🎁 Free (test) | Local development |

For this bounty submission, we use **Devnet**.

---

## Step 1: Configure Environment Variables

Create `.env.local` in your project root:

```env
# ===========================
# LAZORKIT CONFIGURATION
# ===========================
# Get these from https://lazorkit.com/dashboard
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://paymaster.lazorkit.com
NEXT_PUBLIC_LAZORKIT_API_KEY=lzk_test_your_api_key_here
NEXT_PUBLIC_LOOKUP_TABLE_ADDRESS=your_lookup_table_address

# ===========================
# SOLANA DEVNET RPC
# ===========================
# Option 1: Public devnet RPC (free but rate-limited)
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Option 2: Helius devnet RPC (recommended - faster, no rate limits)
# Get free API key from https://helius.dev
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# ===========================
# APPLICATION SETTINGS
# ===========================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Why Use Custom RPC?

The public devnet RPC (`https://api.devnet.solana.com`) is:
- ❌ Rate-limited (can throttle your app)
- ❌ Slower response times
- ❌ May be down during high traffic

**Recommended Free Providers:**
- [Helius](https://helius.dev) - 100k free requests/day
- [QuickNode](https://quicknode.com) - Free tier available

---

## Step 2: Get Devnet SOL

Even though transactions may be gasless via Lazorkit, you still need devnet SOL for certain operations like creating token accounts.

### Method 1: Solana CLI (Recommended)

```bash
# Install Solana CLI (if not already installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Configure to devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL to your wallet
solana airdrop 2 YOUR_WALLET_ADDRESS

# Check balance
solana balance YOUR_WALLET_ADDRESS
```

### Method 2: Web Faucets

Visit these faucets and paste your wallet address:
- [Solana Faucet](https://faucet.solana.com)
- [QuickNode Faucet](https://faucet.quicknode.com/solana/devnet)

> [!NOTE]
> Faucets may be rate-limited. If one fails, try another after a few minutes.

---

## Step 3: Get Devnet USDC

For the CadPay subscription demo, you need devnet USDC.

### Mint Devnet USDC

Use the built-in faucet in CadPay dashboard:

1. Create a wallet at `/create`
2. Navigate to dashboard
3. Click "Add Funds" button
4. Select "Mint Test USDC"
5. Receive 100 devnet USDC (gasless!)

### Token Mint Addresses

For development reference:

```typescript
// Devnet USDC Mint
const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Wrapped SOL Mint
const SOL_MINT = 'So11111111111111111111111111111111111111112';
```

---

## Step 4: Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Testing Checklist

- [ ] Create wallet with biometrics
- [ ] Verify wallet address shows in dashboard
- [ ] Mint test USDC (gasless transaction)
- [ ] Subscribe to a service (e.g., Netflix)
- [ ] Check merchant portal shows transaction
- [ ] Try Jupiter swap (USDC → SOL)
- [ ] Verify all transactions are gasless (SOL balance = 0)

---

## Step 5: Deploy to Production

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## Step 6: Verify Deployment

After deploying, test the live site:

### Functional Tests

1. **Wallet Creation**
   ```
   Visit: https://cadpay.vercel.app/create
   - Create wallet with Face ID/Touch ID
   - Verify redirect to dashboard
   ```

2. **Token Operations**
   ```
   - Mint devnet USDC
   - Check transaction on Solana Explorer (devnet)
   - Verify 0 SOL gas fees
   ```

3. **Subscriptions**
   ```
   - Subscribe to any service
   - Confirm transaction signature
   - View in merchant portal
   ```

4. **Jupiter Integration**
   ```
   Visit: https://cadpay.vercel.app/jupiter
   - Fetch USDC → SOL quote
   - Execute swap
   - Verify on-chain
   ```

### Check Solana Explorer

Visit [explorer.solana.com](https://explorer.solana.com/?cluster=devnet) and search for your:
- Wallet address
- Transaction signatures
- Token accounts

Make sure you're on **devnet mode**!

---

## Step 7: Submit for Review

### For Judges/Reviewers

Create a `DEMO_INSTRUCTIONS.md`:

```markdown
# CadPay Demo Instructions (Devnet)

## Quick Start
1. Visit: https://cadpay.vercel.app
2. Click "Create Wallet"
3. Authenticate with Face ID/Touch ID (or PIN)
4. Click "Add Funds" → "Mint Test USDC"
5. Subscribe to Netflix ($9.99/month)
6. Visit Merchant Portal (credentials: Admin@gmail.com / admin)
7. See your transaction appear in real-time!

## Test Jupiter Integration
1. Navigate to `/jupiter`
2. Enter amount (e.g., 10 USDC)
3. Click "Swap (Gasless)"
4. Verify SOL received without paying gas

## Verify Devnet
All transactions are on Solana devnet. Check any signature on:
https://explorer.solana.com/?cluster=devnet
```

---

## Troubleshooting

### "Transaction Failed" Errors

```typescript
// Check RPC health
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL);
const health = await connection.getHealth();
console.log('RPC Health:', health);

// Try alternate RPC if issues persist
```

### "Insufficient Funds"

```bash
# User wallet needs devnet SOL for account rent
solana airdrop 1 USER_WALLET_ADDRESS

# Or use CadPay's built-in faucet
```

### Paymaster Not Working

```env
# Verify paymaster URL is correct
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://paymaster.lazorkit.com

# Check API key is valid
NEXT_PUBLIC_LAZORKIT_API_KEY=lzk_test_...
```

### Transactions Not Appearing

```typescript
// Add commitment level
const connection = new Connection(rpcUrl, 'confirmed');

// Wait for confirmation
await connection.confirmTransaction(signature, 'confirmed');
```

---

## Best Practices

### 1. Use Consistent Network

```typescript
// Always check you're on devnet
const cluster = 'devnet';
const explorerUrl = `https://explorer.solana.com/?cluster=${cluster}`;
```

### 2. Handle Rate Limits

```typescript
// Implement retry logic
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetch(url);
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
```

### 3. Clear User Instructions

```typescript
// Show network badge in UI
<div className="badge">
    🧪 Devnet Mode - Test tokens only
</div>
```

### 4. Monitor Devnet Status

Check [status.solana.com](https://status.solana.com) - devnet can occasionally be unstable.

---

## Devnet vs Mainnet Differences

When moving to mainnet later:

| Aspect | Devnet | Mainnet |
|--------|--------|---------|
| **RPC URL** | `api.devnet.solana.com` | `api.mainnet-beta.solana.com` |
| **Explorer** | `?cluster=devnet` | Default (no cluster param) |
| **Token Mints** | Test mints | Real token contracts |
| **Gas Costs** | Free (airdrop) | Real SOL (~$0.0001/tx) |
| **Paymaster** | Test mode | Production billing |

Update environment variables:

```diff
- NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
+ NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Resources

- [Solana Devnet Faucet](https://faucet.solana.com)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Helius RPC (Free Tier)](https://helius.dev)
- [Solana CLI Documentation](https://docs.solana.com/cli)
- [Lazorkit Docs](https://docs.lazorkit.com)

---

**Previous:** [← Jupiter Integration Tutorial](./TUTORIAL_JUPITER_INTEGRATION.md)  
**Next:** [Bounty Requirements Overview →](./BOUNTY_REQUIREMENTS.md)
