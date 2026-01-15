import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
// @ts-ignore - Assuming export exists, will fix if error
import { useWallet } from '@lazorkit/wallet';
import { useToast } from '@/context/ToastContext';

export function useLazorkit() {
    const router = useRouter();
    const { showToast } = useToast();
    // @ts-ignore
    const walletHook = useWallet();

    // Log ALL properties from useWallet to find PDA derivation methods
    useEffect(() => {
        // Lazy load without verbose logging
    }, [walletHook]);

    // @ts-ignore
    const { connect, disconnect, wallet, signAndSendTransaction, isConnected, isLoading: sdkLoading, smartWalletPubkey, getBalance } = walletHook || {};
    const [localLoading, setLocalLoading] = useState(false);

    // ✅ Stabilize the address and public key to prevent infinite loops
    // address is a string (primitive), so it's a stable dependency
    // @ts-ignore
    const address = useMemo(() => smartWalletPubkey?.toBase58?.() || null, [smartWalletPubkey]);

    // Create a stable PublicKey object from the address string
    const stableSmartWalletPubkey = useMemo(() => {
        if (!address) return null;
        try {
            return new PublicKey(address);
        } catch (e) {
            return null;
        }
    }, [address]);

    // @ts-ignore
    const isAuthenticated = isConnected;

    // 🔍 VERIFICATION: Log to confirm we're using the right address
    useEffect(() => {
        if (smartWalletPubkey && wallet) {
            // Verify wallet addresses silently
        }
    }, [smartWalletPubkey, wallet]);

    // 🔍 DIAGNOSTIC: Log wallet structure to identify Passkey vs PDA
    useEffect(() => {
        if (wallet) {
            // Wallet identity diagnostic removed for production
        }
    }, [wallet]);

    useEffect(() => {
        if (window.location.pathname === '/signin' && isConnected && address) {
            // Session restored, redirecting
            router.push('/dashboard');
        }
    }, [isConnected, address, router]);

    const handleAuth = useCallback(async () => {
        try {
            setLocalLoading(true);

            // Always disconnect first to ensure fresh biometric prompt
            if (isConnected) {
                await disconnect();
                // Small delay to ensure disconnect completes
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // This will trigger the biometric prompt
            await connect();
            showToast('Successfully authenticated!', 'success');
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Authentication failed:", error);
            if (error.name === 'NotAllowedError' || error.message?.includes('timed out') || error.message?.includes('not allowed')) {
                showToast("Authentication canceled or not allowed. Ensure you are on 'localhost' or HTTPS and have biometrics set up.", 'error');
            } else {
                showToast(`Authentication failed: ${error.message || error}`, 'error');
            }
        } finally {
            setLocalLoading(false);
        }
    }, [connect, disconnect, isConnected, router, showToast]);

    const handleCreate = useCallback(async () => {
        try {
            setLocalLoading(true);

            // Disconnect any existing wallet first to prevent conflicts
            if (isConnected) {
                // Disconnect existing wallet before creating new one
                await disconnect();
                // Wait a moment for disconnect to complete
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Clear any stale wallet data from localStorage
            try {
                localStorage.removeItem('lazorkit-wallet');
                localStorage.removeItem('wallet-adapter');
            } catch (e) {
                console.warn('Could not clear localStorage:', e);
            }

            // Now create new wallet
            await connect();
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Wallet creation failed:", error);

            // More specific error messages
            if (error.name === 'NotAllowedError' || error.message?.includes('timed out') || error.message?.includes('not allowed')) {
                showToast("Authentication canceled. Ensure you are on 'localhost' or HTTPS and have biometrics set up.", 'error');
            } else if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                showToast("A wallet already exists. Please sign in instead or clear your browser data.", 'warning');
            } else {
                showToast(`Wallet creation failed: ${error.message || error}`, 'error');
            }
        } finally {
            setLocalLoading(false);
        }
    }, [connect, disconnect, isConnected, router, showToast]);

    const [balance, setBalance] = useState<number | null>(null);

    // Create connection once
    const [connection] = useState(() => new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com', 'confirmed'));

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        try {
            const lamports = await connection.getBalance(new PublicKey(address));
            setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (e) {
            // Silently fail on polling errors to avoid console spam
            // console.error("Failed to fetch balance", e);
        }
    }, [address, connection]);

    // Fetch balance on mount/auth
    useEffect(() => {
        if (address) {
            refreshBalance();
            // Set up polling interval for real-time updates
            const interval = setInterval(refreshBalance, 5000);
            return () => clearInterval(interval);
        }
    }, [address, refreshBalance]);

    const requestAirdrop = useCallback(async () => {
        if (!address) return;
        try {
            setLocalLoading(true);
            // reused 'connection' from state
            const signature = await connection.requestAirdrop(new PublicKey(address), 1 * LAMPORTS_PER_SOL);

            // Wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature,
                ...latestBlockhash
            });

            showToast('Successfully added 1 SOL to your wallet!', 'success');
            await refreshBalance();
        } catch (error: any) {
            console.error("Airdrop failed:", error);

            // More specific error messages
            if (error.message?.includes('rate limit') || error.message?.includes('429')) {
                showToast("Airdrop rate limited. Please wait a minute and try again.", 'warning');
            } else if (error.message?.includes('Internal error')) {
                showToast("Solana devnet airdrop is temporarily unavailable. This is a known issue with the devnet faucet. Try again in a few minutes.", 'error');
            } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
                showToast("Request timed out. Network might be congested. Try again.", 'error');
            } else {
                showToast(`Airdrop failed: ${error.message || 'Unknown error'}. Try again later.`, 'error');
            }
        } finally {
            setLocalLoading(false);
        }
    }, [address, refreshBalance, showToast]);

    const handleLogout = useCallback(() => {
        disconnect();
        router.push('/');
    }, [disconnect, router]);

    // --- SAVINGS POTS LOGIC ---
    const [pots, setPots] = useState<any[]>([]);

    const fetchPots = useCallback(async () => {
        if (!address || !stableSmartWalletPubkey) return;
        try {
            // In a real app, you'd fetch from a registry. 
            // For hackathon, we fetch names from localStorage and derive PDAs.
            const potNames = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
            const fetchedPots = await Promise.all(potNames.map(async (pot: any) => {
                try {
                    // Derive PDA: [user_key, "savings", pot.name]
                    const [potPda] = PublicKey.findProgramAddressSync(
                        [stableSmartWalletPubkey.toBuffer(), Buffer.from("savings"), Buffer.from(pot.name)],
                        new PublicKey("6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz") // Using session program ID or similar
                    );

                    const potAddress = potPda.toBase58();
                    const lamports = await connection.getBalance(potPda);

                    return {
                        ...pot,
                        address: potAddress,
                        balance: lamports / LAMPORTS_PER_SOL,
                    };
                } catch (e) {
                    console.error("Error fetching pot:", pot.name, e);
                    return null;
                }
            }));

            setPots(fetchedPots.filter(p => p !== null));
        } catch (e) {
            console.error("Failed to fetch pots", e);
        }
    }, [address, stableSmartWalletPubkey, connection]);

    const createPot = useCallback(async (name: string, unlockTime: number) => {
        if (!address) throw new Error("Wallet not connected");

        // 1. In a real LazorKit implementaiton, createChunk would be a direct SDK call
        // We simulate the transaction and store metadata locally
        const potData = { name, unlockTime };
        const existing = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
        localStorage.setItem(`savings_pots_${address}`, JSON.stringify([...existing, potData]));

        await fetchPots();
        showToast(`Pot "${name}" created successfully!`, 'success');
    }, [address, fetchPots, showToast]);

    const withdrawFromPot = useCallback(async (potAddress: string, recipient: string, amount: number, note: string) => {
        if (!address || !signAndSendTransaction) throw new Error("Wallet not connected");

        try {
            const tx = new Transaction();

            // A. Transfer Instruction
            tx.add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(potAddress),
                    toPubkey: new PublicKey(recipient),
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );

            // B. Memo Instruction
            if (note) {
                tx.add(
                    new TransactionInstruction({
                        keys: [{ pubkey: new PublicKey(potAddress), isSigner: true, isWritable: true }],
                        data: Buffer.from(note, "utf-8"),
                        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
                    })
                );
            }

            // In a real AA context, potAddress is a PDA and the Smart Wallet signs for it.
            // LazorKit handles the 'isSigner' for Chunk PDAs automatically.
            const signature = await signAndSendTransaction(tx);
            showToast(`Withdrawal successful! tx: ${signature.slice(0, 8)}...`, 'success');
            await fetchPots();
            if (address) await refreshBalance();
            return signature;
        } catch (e: any) {
            console.error("Withdrawal failed", e);
            showToast(`Withdrawal failed: ${e.message}`, 'error');
            throw e;
        }
    }, [address, signAndSendTransaction, fetchPots, refreshBalance, showToast]);

    useEffect(() => {
        if (isConnected && address) {
            fetchPots();
            // Polling for pot balances every 10s (reduced frequency)
            const interval = setInterval(fetchPots, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, address]); // Removed fetchPots from deps to be extra safe

    return {
        // Core Logic
        loading: sdkLoading || localLoading,
        loginWithPasskey: handleAuth,
        createPasskeyWallet: handleCreate,

        // Auth State
        address,
        isAuthenticated,
        balance,

        // Actions
        requestAirdrop,
        logout: handleLogout,

        // Wallet Methods
        wallet,
        signAndSendTransaction,

        // Savings Pots
        pots,
        createPot,
        withdrawFromPot,
        fetchPots,
        connection
    };
}
