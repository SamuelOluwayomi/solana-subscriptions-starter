# 🛠️ Demo Reliability & Troubleshooting Guide

This guide ensures a 100% success rate when demoing **CadPay** on Solana Devnet. Use these tips to navigate common blockchain edge cases professionally.

---

## 1. "Transaction Too Old" (0x1783)
This is the most common Solana error, usually caused by a difference between your computer's clock and the network's consensus time.

**Solution:**
*   **Sync System Clock:** Go to your computer's Date & Time settings and click **"Sync now"**. 
*   **Sign Fast:** When using Passkeys/Lazorkit, try to complete the biometric sign step (TouchID/FaceID) within 10-15 seconds of the prompt.
*   **Refresh:** If it persists, a simple page refresh will grab a fresh network blockhash.

## 2. Devnet RPC Rate Limits
Solana Devnet public nodes (like `api.devnet.solana.com`) are often under heavy load during hackathons.

**Solution:**
*   **Wait & Retry:** If you see "Too Many Requests" or "429" errors in the console, wait 10 seconds before trying the action again.
*   **Managed RPC:** For the best experience, use a managed RPC endpoint (QuickNode, Helius, or Alchemy) by setting `NEXT_PUBLIC_RPC_URL` in your `.env.local`.

## 3. Airdrop Fails (Rate Limited)
The official Solana Devnet airdrop faucet is frequently rate-limited by IP or wallet.

**Solution:**
*   **Manual Funding:** If the automatic airdrop fails, we've provided your **Smart Wallet Address** in the Onboarding Modal. Copy it and use a separate faucet (like [solfaucet.com](https://solfaucet.com)) or transfer a tiny bit of Devnet SOL from another wallet.
*   **USDC Faucet:** Our internal "Add USDC" button uses a custom faucet that is significantly more reliable for demoing subscription payments.

## 4. Onboarding Modal Re-appears
If you just completed a transaction but the Onboarding modal comes back, it's usually just "lag" in the blockchain indexer.

**Solution:**
*   **Wait 3 Seconds:** We use **Optimistic UI** to hide the modal instantly, but if you refresh immediately, the data might not have traveled to your specific RPC node yet.
*   **Check Explorer:** Click the "View on Explorer" link in the success toast to confirm your profile was truly created on-chain.

## 5. Wallet Connection (Lazorkit)
If the "Connect Wallet" button doesn't trigger the Passkey prompt:

**Solution:**
*   **Incognito Mode:** If you have multiple wallet extensions (Phantom, Solflare, etc.) conflicting, try running the demo in an **Incognito Window**.
*   **Browser Check:** Ensure you are using a modern browser with WebAuthn support (Chrome, Safari, or Edge).

---

> [!TIP]
---

## 🌐 Project Links

- **Live Demo:** [https://cadpay.vercel.app/](https://cadpay.vercel.app/)
- **GitHub Repository:** [https://github.com/SamuelOluwayomi/solana-subscriptions-starter](https://github.com/SamuelOluwayomi/solana-subscriptions-starter)
- **Watch the Demo:** [Demo Video Coming Soon]
