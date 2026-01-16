// Imports
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
// @ts-ignore
import { useWallet } from '@lazorkit/wallet';
import { useToast } from '@/context/ToastContext';
import {
    deriveSavingsPotPDA,
    constructCreateSavingsPotTransaction,
    fetchUserSavingsPots
} from '@/utils/savingsAccounts';

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
    // #region agent log
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
    
    // #endregion
    const [connection] = useState(() => new Connection(rpcUrl, 'confirmed'));

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        // #region agent log
        
        // #endregion
        try {
            const lamports = await connection.getBalance(new PublicKey(address));
            const solBalance = lamports / LAMPORTS_PER_SOL;
            // #region agent log
            
            // #endregion
            setBalance(solBalance);
        } catch (e: any) {
            // #region agent log
            
            // #endregion
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
            const potMetaData = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
            
            // Separate wallet-based pots from PDA-based pots
            const walletBasedPots = potMetaData.filter((p: any) => p.isWalletBased);
            const pdaBasedPots = potMetaData.filter((p: any) => !p.isWalletBased);

            // Fetch balances for wallet-based pots
            const walletPotsWithBalance = await Promise.all(
                walletBasedPots.map(async (pot: any) => {
                    try {
                        const balance = await connection.getBalance(new PublicKey(pot.address));
                        const { getAssociatedTokenAddress } = await import('@solana/spl-token');
                        const { CADPAY_MINT } = await import('@/utils/cadpayToken');
                        
                        // Get USDC balance from ATA
                        const ata = await getAssociatedTokenAddress(CADPAY_MINT, new PublicKey(pot.address), true);
                        const ataInfo = await connection.getTokenAccountBalance(ata).catch(() => null);
                        const usdcBalance = ataInfo ? ataInfo.value.uiAmount || 0 : 0;

                        return {
                            ...pot,
                            balance: usdcBalance,
                            solBalance: balance / LAMPORTS_PER_SOL,
                        };
                    } catch (e) {
                        console.warn(`Failed to fetch balance for pot ${pot.name}:`, e);
                        return { ...pot, balance: 0, solBalance: 0 };
                    }
                })
            );

            // Fetch PDA-based pots (existing logic)
            let pdaPots: any[] = [];
            if (pdaBasedPots.length > 0) {
                try {
                    const names = pdaBasedPots.map((p: any) => p.name);
                    const fetchedPots = await fetchUserSavingsPots(stableSmartWalletPubkey, connection, names);
                    pdaPots = fetchedPots.map(p => {
                        const meta = pdaBasedPots.find((m: any) => m.name === p.name);
                        return { ...p, ...meta };
                    });
                } catch (e) {
                    console.warn("Failed to fetch PDA-based pots:", e);
                }
            }

            // Combine both types
            setPots([...walletPotsWithBalance, ...pdaPots]);
        } catch (e) {
            console.error("Failed to fetch pots", e);
            // Fallback to just local metadata
            const potMetaData = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
            setPots(potMetaData);
        }
    }, [address, stableSmartWalletPubkey, connection]);

    const createPot = useCallback(async (name: string, unlockTime: number) => {
        // Basic validation
        if (!address) {
            throw new Error("Wallet address is not available. Please connect your wallet.");
        }
        if (!connection) {
            throw new Error("Connection is not available.");
        }

        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error(`Invalid pot name: "${name}". Must be a non-empty string.`);
        }
        if (name.length > 32) {
            throw new Error(`Pot name "${name}" is too long. Maximum 32 characters.`);
        }

        // Validate unlockTime
        const unlockTimeInt = Math.floor(Number(unlockTime));
        if (unlockTime === undefined || unlockTime === null || isNaN(unlockTime) || unlockTimeInt <= 0) {
            throw new Error(`Invalid unlock time: ${unlockTime}. Must be a positive Unix timestamp.`);
        }

        try {
            setLocalLoading(true);
            showToast('Creating new savings wallet...', 'info');

            // 1. Generate a brand new account (wallet) for this specific pot
            const { Keypair } = await import('@solana/web3.js');
            const potKeypair = Keypair.generate();
            const potPubkey = potKeypair.publicKey;

            console.log(`✅ New Pot Wallet Created: ${potPubkey.toBase58()}`);

            // 2. Fund this new wallet from Treasury for Rent
            showToast('Funding new wallet from treasury...', 'info');
            const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(0); // Standard account rent
            
            const fundResponse = await fetch('/api/fund-rent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    accountAddress: potPubkey.toBase58(),
                    rentAmount: rentExemptAmount
                })
            });

            if (!fundResponse.ok) {
                const errorData = await fundResponse.json();
                throw new Error(`Treasury funding failed: ${errorData.error || 'Unknown error'}`);
            }

            const fundData = await fundResponse.json();
            console.log('✅ Rent funded from treasury:', fundData.signature);
            
            // Wait a moment for the rent transfer to confirm
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Save the Pot Metadata locally
            const newPot = {
                name,
                address: potPubkey.toBase58(),
                unlockTime: unlockTimeInt,
                balance: 0,
                isWalletBased: true, // Flag to identify wallet-based pots
                createdAt: Date.now()
            };

            const existingPots = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
            const updatedPots = [...existingPots.filter((p: any) => p.name !== name), newPot];
            localStorage.setItem(`savings_pots_${address}`, JSON.stringify(updatedPots));

            // 4. Refresh pots and show success
            await fetchPots();
            showToast(`Success! Savings pot "${name}" created as separate wallet.`, 'success');
            
            return potPubkey.toBase58();

        } catch (error: any) {
            console.error("Failed to create separate wallet pot:", error);
            showToast(`Failed to create savings pot: ${error.message}`, 'error');
            throw error;
        } finally {
            setLocalLoading(false);
        }
    }, [address, connection, fetchPots, showToast]);

    const withdrawFromPot = useCallback(async (potName: string, recipient: string, amount: number, note: string) => {
        if (!address || !signAndSendTransaction) throw new Error("Wallet not connected");

        try {
            const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
            const { CADPAY_MINT } = await import('@/utils/cadpayToken');
            const { AnchorProvider, Program, BN } = await import('@coral-xyz/anchor');
            const idl = await import('../../anchor/target/idl/cadpay_profiles.json');

            const [potPda] = deriveSavingsPotPDA(new PublicKey(address), potName);
            const potAta = await getAssociatedTokenAddress(CADPAY_MINT, potPda, true);
            const recipientAta = await getAssociatedTokenAddress(CADPAY_MINT, new PublicKey(recipient), true);

            // Construct Transaction
            const provider = new AnchorProvider(connection, (wallet as any), {});
            const program = new Program(idl as any, provider);

            const tx = await program.methods
                .withdrawFromPot(new BN(amount * 1_000_000))
                .accounts({
                    savingsPot: potPda,
                    authority: new PublicKey(address),
                    potAta: potAta,
                    recipientAta: recipientAta,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .transaction();

            // B. Memo Instruction
            if (note) {
                const { createMemoInstruction } = await import('@solana/spl-memo');
                tx.add(createMemoInstruction(note, [new PublicKey(address)]));
            }

            // Don't set blockhash manually - Lazorkit's signAndSendTransaction handles it
            // Setting it here can cause "TransactionTooOld" errors if there's any delay
            // Lazorkit will fetch a fresh blockhash when signing
            
            // Set fee payer
            tx.feePayer = new PublicKey(address);

            // Sign and send using Lazorkit (it will handle blockhash internally)
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
    }, [address, signAndSendTransaction, connection, fetchPots, refreshBalance, showToast]);

    useEffect(() => {
        if (isConnected && address) {
            fetchPots();
            // Polling for pot balances
            const interval = setInterval(fetchPots, 10000);
            return () => clearInterval(interval);
        }
    }, [isConnected, address]);

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
        connection,
        refreshBalance
    };
}
