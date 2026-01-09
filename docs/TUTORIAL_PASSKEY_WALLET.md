# Tutorial: Creating a Passkey Wallet with Lazorkit

This tutorial walks you through how CadPay implements passwordless, biometric wallet creation using Lazorkit's Passkey integration.

## 🎯 What You'll Learn

- How to integrate Lazorkit's `useWallet` hook
- Creating a wrapper hook for better UX
- Implementing passkey-based wallet creation
- Handling biometric authentication flow
- Managing wallet state and session persistence

## 📚 Prerequisites

- Basic understanding of React hooks
- Familiarity with Next.js
- Lazorkit SDK installed (`@lazorkit/wallet`)

## 🏗️ Architecture Overview

```
User Action → useLazorkit Hook → Lazorkit SDK → WebAuthn API → Secure Enclave
                    ↓
            Smart Wallet Created
                    ↓
            Redirect to Dashboard
```

## Step 1: Setting Up the Lazorkit Hook

The core of our implementation is a custom hook that wraps Lazorkit's SDK.

**File:** `src/hooks/useLazorkit.ts`

### Import Dependencies

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';
```

### Initialize the Wallet Hook

```typescript
export function useLazorkit() {
    const router = useRouter();
    const walletHook = useWallet();
    
    // Destructure Lazorkit methods
    const { 
        connect,           // Triggers wallet creation/login
        disconnect,        // Logs out user
        wallet,            // Wallet object
        smartWalletPubkey, // Smart Wallet PDA address
        isConnected,       // Auth state
        isLoading: sdkLoading 
    } = walletHook || {};
    
    const [localLoading, setLocalLoading] = useState(false);
```

**Key Points:**
- `smartWalletPubkey` is the actual Smart Wallet address (PDA)
- `wallet.smartWallet` is the Passkey address (don't use for transactions)
- Always use `smartWalletPubkey` for on-chain operations

## Step 2: Implementing Wallet Creation

### The `createPasskeyWallet` Function

```typescript
const handleCreate = useCallback(async () => {
    try {
        setLocalLoading(true);
        
        // 1. Disconnect any existing wallet first
        if (isConnected) {
            console.log('Disconnecting existing wallet...');
            await disconnect();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 2. Clear stale localStorage data
        try {
            localStorage.removeItem('lazorkit-wallet');
            localStorage.removeItem('wallet-adapter');
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
        
        // 3. Trigger wallet creation (biometric prompt)
        await connect();
        
        // 4. Redirect to dashboard on success
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Wallet creation failed:", error);
        
        // Handle specific errors
        if (error.name === 'NotAllowedError') {
            // User canceled biometric prompt
            showToast("Authentication canceled. Please try again.", 'error');
        } else if (error.message?.includes('already exists')) {
            showToast("Wallet already exists. Please sign in instead.", 'warning');
        } else {
            showToast(`Creation failed: ${error.message}`, 'error');
        }
    } finally {
        setLocalLoading(false);
    }
}, [connect, disconnect, isConnected, router]);
```

**What Happens Behind the Scenes:**

1. **Browser WebAuthn API** prompts for biometrics
2. **Secure Enclave** generates a keypair (never leaves device)
3. **Lazorkit SDK** derives a Smart Wallet PDA
4. **PDA is initialized** on Solana (if needed)

## Step 3: Building the UI Component

**File:** `src/app/create/page.tsx`

### Basic Structure

```typescript
'use client';

import { useLazorkit } from '@/hooks/useLazorkit';
import { FingerprintIcon } from '@phosphor-icons/react';

export default function CreateAccount() {
    const { createPasskeyWallet, loading, isAuthenticated } = useLazorkit();
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);
    
    const handleCreateWallet = async () => {
        setIsCreatingWallet(true);
        await createPasskeyWallet();
        // Redirects automatically on success
    };
```

### The Create Button

```typescript
<button
    onClick={handleCreateWallet}
    disabled={loading || isCreatingWallet}
    className="w-full bg-white text-black font-bold py-4 rounded-xl"
>
    <div className="flex items-center justify-center gap-3">
        {isCreatingWallet ? (
            <>
                <div className="w-5 h-5 border-2 border-t-black rounded-full animate-spin" />
                <span>Setting Up Your Wallet...</span>
            </>
        ) : (
            <>
                <FingerprintIcon size={20} />
                <span>Create Wallet with Passkey</span>
            </>
        )}
    </div>
</button>
```

### Loading Overlay

```typescript
{isCreatingWallet && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="text-center">
            <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-2xl font-bold text-white mt-6">Creating Your Wallet</p>
            <p className="text-sm text-zinc-400">Please complete biometric authentication...</p>
        </div>
    </div>
)}
```

## Step 4: Implementing Passkey Login

For returning users, implement the login flow:

```typescript
const handleAuth = useCallback(async () => {
    try {
        setLocalLoading(true);
        
        // 1. Disconnect to force fresh biometric prompt
        if (isConnected) {
            await disconnect();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // 2. Connect with existing passkey
        await connect();
        
        showToast('Successfully authenticated!', 'success');
        router.push('/dashboard');
    } catch (error: any) {
        if (error.name === 'NotAllowedError') {
            showToast("Authentication canceled", 'error');
        }
    } finally {
        setLocalLoading(false);
    }
}, [connect, disconnect, isConnected, router]);
```

## Step 5: Accessing the Smart Wallet

Once authenticated, use the Smart Wallet address:

```typescript
const { address, isAuthenticated, balance } = useLazorkit();

// Display wallet info
{isAuthenticated && (
    <div>
        <p>Wallet Address: {address}</p>
        <p>Balance: {balance} SOL</p>
    </div>
)}
```

## Step 6: Session Persistence

Lazorkit automatically persists sessions in localStorage:

```typescript
// On page load/refresh
useEffect(() => {
    if (address) {
        console.log('Session restored for:', address);
        // User remains logged in
    }
}, [address]);
```

## 🎨 User Experience Flow

1. **User clicks "Create Wallet"**
2. **Biometric prompt appears** (Face ID, Touch ID, Windows Hello)
3. **User authenticates** with biometrics
4. **Wallet created** in Secure Enclave
5. **PDA derived** and initialized on Solana
6. **Redirected to dashboard** - ready to use!

## ✅ Testing Checklist

- [ ] Wallet creation triggers biometric prompt
- [ ] Successful authentication redirects to dashboard
- [ ] Wallet address is displayed correctly
- [ ] Session persists after page refresh
- [ ] Error handling works for canceled prompts
- [ ] Works on different browsers (Chrome, Safari, Edge)
- [ ] Works on mobile devices

## 🐛 Common Issues

### "NotAllowedError"
- **Cause:** User canceled biometric prompt or timeout
- **Fix:** Ensure you're on `localhost` or HTTPS

### "Wallet already exists"
- **Cause:** Passkey already registered for this domain
- **Fix:** Clear browser data or use sign-in flow

### Session not persisting
- **Cause:** localStorage cleared or blocked
- **Fix:** Check browser privacy settings

## 🎯 Key Takeaways

1. ✅ Never ask users for seed phrases
2. ✅ Always use `smartWalletPubkey` for transactions
3. ✅ Handle errors gracefully with user-friendly messages
4. ✅ Test on multiple devices and browsers
5. ✅ Lazorkit handles session persistence automatically

## 📚 Next Steps

Continue to [Tutorial 2: Gasless Transactions](./TUTORIAL_GASLESS_TRANSACTIONS.md) to learn how to sponsor user fees with Paymaster.

## 🔗 References

- [Lazorkit Documentation](https://docs.lazorkit.com)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
