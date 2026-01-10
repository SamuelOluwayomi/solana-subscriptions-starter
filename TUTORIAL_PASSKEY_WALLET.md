# Passkey Wallet Tutorial

## What is a Passkey Wallet?

CadPay uses **passkey-based authentication** powered by Lazorkit, eliminating the need for traditional seed phrases. Your wallet is secured using your device's biometric authentication (Face ID, Touch ID, or Windows Hello).

## How It Works

### 1. **Account Creation**
When you create a wallet:
- No seed phrase is generated
- A cryptographic key pair is created and stored securely in your device's hardware
- The private key never leaves your device
- Your biometric data authenticates signing operations

### 2. **Authentication Flow**
```
User clicks "Create Wallet" 
  → Device prompts for biometric (Face ID/Touch ID)
  → Passkey created and stored in device
  → Smart wallet PDA derived on Solana
  → User can immediately transact
```

### 3. **Security Benefits**
✅ **No seed phrase to lose or forget**  
✅ **Phishing resistant** - keys can't be typed or copied  
✅ **Hardware-backed security** - keys stored in secure enclave  
✅ **Cross-device sync** (via iCloud/Google Password Manager)  

## Implementation in CadPay

### Customer Side
1. Navigate to `/signin`
2. Click "Create Wallet"
3. Authenticate with your biometric
4. Done! Your wallet is ready

### Code Example
```typescript
import { useWallet } from '@lazorkit/wallet';

const { connect, isConnected, smartWalletPubkey } = useWallet();

// Create/Connect wallet
await connect(); // Triggers biometric prompt

// Sign transaction (no seed phrase needed!)
const signature = await signAndSendTransaction(transaction);
```

### Smart Wallet PDA
Your actual wallet address is a **Program Derived Address (PDA)**:
```typescript
const smartWalletPDA = smartWalletPubkey.toBase58(); 
// e.g., "GenHeNGnqhM23wbn54r1zov86gtcp5VXjGYWtWfD4oHG"
```

This is different from the passkey public key and is deterministically derived.

## Troubleshooting

### "Authentication failed"
- Ensure you're on `localhost` or `https://` (passkeys require secure context)
- Check that biometrics are enabled on your device
- Try clearing browser cache and reconnecting

### "Wallet not found"
- The wallet is device-specific - you'll need to recreate on new devices
- Consider exporting recovery options if needed

## Best Practices

1. **Enable iCloud Keychain** (iOS) or **Google Password Manager** (Android) for backup
2. **Test on localhost first** before deploying
3. **Consider fallback authentication** for users without biometrics
4. **Educate users** that their "password" is their face/fingerprint

## Resources
- [Lazorkit Documentation](https://docs.lazorkit.com/)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [Passkeys.dev](https://passkeys.dev/)

---

**Next:** Learn about [Gasless Transactions →](./TUTORIAL_GASLESS_TRANSACTIONS.md)
