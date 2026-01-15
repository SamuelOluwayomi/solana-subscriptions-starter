# Quick Start: Deploying Savings Accounts

## Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI

## Step 1: Deploy Smart Contract

```bash
cd anchor
anchor build
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: <YOUR_WALLET>
Deploying program "<PROGRAM_ID>"
Program Id: 6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz
```

**Update Environment:**
If the Program ID changed, update in:
- `.env.local`: `NEXT_PUBLIC_PROGRAM_ID`
- `src/utils/savingsAccounts.ts`: `PROGRAM_ID` constant
- `src/hooks/useLazorkit.ts`: PDA derivation

## Step 2: Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Step 3: Test Savings Pot Creation

1. **Sign in or Create Wallet**
   - Navigate to `/signin` or `/create`
   - Use device biometrics

2. **Go to Dashboard**
   - Click "Savings Wallet" in sidebar
   - Click "New Savings Pot"

3. **Create a Pot**
   - Name: "Emergency Fund"
   - Duration: 1 month
   - Click "Create"

4. **Verify On-Chain**
   ```bash
   # Get pot address
   solana address -k <keypair>
   
   # Check balance
   solana balance <POT_ADDRESS> --url devnet
   ```

## Step 4: Test Send Function

1. **Navigate to Overview**
   - Click "Send Funds" button

2. **Send to Another Wallet**
   - Recipient: Enter valid Solana address
   - Amount: 0.1 SOL
   - Click "Send"

3. **Verify Transaction**
   - Check Solana Explorer: https://explorer.solana.com/?cluster=devnet
   - Look for transaction hash from toast notification

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         CadPay Dashboard                │
│  (Next.js, React, Tailwind CSS)         │
└──────────────┬──────────────────────────┘
               │
               ├─→ useLazorkit Hook
               │   - Wallet management
               │   - Transaction signing
               │   - Balance tracking
               │
               ├─→ savingsAccounts Utilities
               │   - PDA derivation
               │   - Rent calculation
               │   - Transaction building
               │
               └─→ Lazorkit SDK
                   - Account Abstraction
                   - Biometric Auth
                   - Gasless Support
                   
┌─────────────────────────────────────────┐
│         Solana Network (Devnet)         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  CadPay Program (on-chain)         │ │
│  │  - User Profiles                   │ │
│  │  - Savings Pots (NEW!)             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Common Issues & Fixes

### Issue: "Blockhash not found"
**Cause**: Transaction blockhash expired or invalid
**Fix**: Already handled in `handleUnifiedSend` with `getLatestBlockhash('finalized')`

### Issue: "Insufficient balance for rent"
**Cause**: Savings pot creation needs rent + initial balance
**Fix**: Frontend pre-funds the account (Paymaster pattern)

### Issue: "PotLocked" error on withdrawal
**Cause**: Trying to withdraw before unlock time
**Expected**: This is correct behavior! Unlock time prevents early withdrawal

### Issue: Wallet not connected
**Cause**: User not authenticated
**Fix**: Redirect to `/signin` or `/create`

### Issue: Transaction fails silently
**Cause**: Network congestion or invalid parameters
**Fix**: Check toast notifications for error messages

## Performance Optimization

### Caching:
- Pot balances cached in localStorage
- Refreshes every 10 seconds
- Manual refresh button available

### Gas Optimization:
- Address Lookup Tables reduce transaction size
- Instruction packing reduces compute units
- Already enabled in existing code

### Rate Limiting:
- Pot fetching limited to once per 10 seconds
- Balance refresh limited to once per 5 seconds
- Prevents RPC spam

## Security Notes

✅ **Secure by Default:**
- Private keys never leave device (Secure Enclave)
- Biometric authentication required
- Transaction signatures happen locally
- No server-side key storage

⚠️ **Best Practices:**
- Always verify recipient address before sending
- Use testnet (devnet) for testing
- Store backup passkey credentials securely
- Monitor account activity in explorer

## Deployment Checklist

- [ ] Smart contract deployed to devnet
- [ ] Frontend environment variables updated
- [ ] Wallet creation tested
- [ ] Savings pot creation tested
- [ ] Send function tested
- [ ] Balance updates working
- [ ] Error messages showing correctly
- [ ] Responsive design verified
- [ ] Console errors cleared
- [ ] Ready for demo!

## Support

If you encounter issues:

1. **Check logs**:
   ```bash
   # Frontend
   npm run dev
   # Check console in browser DevTools
   
   # Solana
   solana logs --url devnet | grep <PROGRAM_ID>
   ```

2. **Verify setup**:
   - Correct devnet endpoint: https://api.devnet.solana.com
   - Correct program ID in code
   - Wallet has SOL for testing

3. **Debug transactions**:
   - Check Solana Explorer for detailed errors
   - Verify PDA derivation matches on-chain
   - Ensure recent blockhash is used

## Next Steps

After successful testing:
1. **Mainnet Deployment** - Deploy to mainnet-beta
2. **Test with Real SOL** - Use live network testing
3. **Security Audit** - Have program reviewed by professionals
4. **User Testing** - Get feedback from beta users
