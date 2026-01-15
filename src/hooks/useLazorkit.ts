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
    fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLazorkit.ts:135',message:'Creating connection in useLazorkit',data:{rpcUrl,envVar:process.env.NEXT_PUBLIC_RPC_URL||'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const [connection] = useState(() => new Connection(rpcUrl, 'confirmed'));

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLazorkit.ts:137',message:'refreshBalance called',data:{address},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
            const lamports = await connection.getBalance(new PublicKey(address));
            const solBalance = lamports / LAMPORTS_PER_SOL;
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLazorkit.ts:141',message:'SOL balance fetched',data:{solBalance,lamports},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            setBalance(solBalance);
        } catch (e: any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useLazorkit.ts:145',message:'refreshBalance failed',data:{error:e?.message||String(e),errorType:e?.name||'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
            const names = potMetaData.map((p: any) => p.name);
            const fetchedPots = await fetchUserSavingsPots(stableSmartWalletPubkey, connection, names);

            // Merge with local metadata (unlockTime)
            const enriched = fetchedPots.map(p => {
                const meta = potMetaData.find((m: any) => m.name === p.name);
                return { ...p, ...meta };
            });

            setPots(enriched);
        } catch (e) {
            console.error("Failed to fetch pots", e);
        }
    }, [address, stableSmartWalletPubkey, connection]);

    const createPot = useCallback(async (name: string, unlockTime: number) => {
        // 1. Safety Checks (Prevention of the '_bn' error)
        if (!address) {
            throw new Error("Wallet address is not available. Please connect your wallet.");
        }
        if (!signAndSendTransaction) {
            throw new Error("Wallet signer is not available. Please connect your wallet.");
        }
        if (!wallet) {
            throw new Error("Wallet object is not available. Please connect your wallet.");
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
            showToast('Preparing savings pot creation...', 'info');

            // 2. Import required modules
            const { AnchorProvider, Program, BN } = await import('@coral-xyz/anchor');
            const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
            const { CADPAY_MINT } = await import('@/utils/cadpayToken');
            const idlModule = await import('../../anchor/target/idl/cadpay_profiles.json');

            // 2.1. Validate CADPAY_MINT (critical to prevent _bn error)
            if (!CADPAY_MINT || !(CADPAY_MINT instanceof PublicKey)) {
                throw new Error('CADPAY_MINT is invalid or undefined. Please check cadpayToken.ts');
            }

            // 2.2. Program ID (from Rust declare_id! macro)
            const PROGRAM_ID = new PublicKey('6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz');

            // 2.3. Extract IDL from default export and add program address if missing (prevents _bn error)
            const idl = (idlModule.default || idlModule) as any;
            const idlWithAddress = {
                ...idl,
                metadata: {
                    ...(idl.metadata || {}),
                    address: PROGRAM_ID.toBase58(),
                },
            };

            // 3. Derive PDA and ATA for the Pot
            const userPubKey = new PublicKey(address);
            const [potPda] = deriveSavingsPotPDA(userPubKey, name);
            const potAta = await getAssociatedTokenAddress(CADPAY_MINT, potPda, true);

            // 4. Fund Rent from Treasury (if needed)
            const potAccountInfo = await connection.getAccountInfo(potPda);
            const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(
                8 + 32 + (4 + 32) + 8 + 8 + 8 + 1 // SavingsPot account size from Rust
            );

            if (!potAccountInfo || potAccountInfo.lamports < rentExemptAmount) {
                showToast('Funding rent for savings pot from treasury...', 'info');
                try {
                    const fundRentResponse = await fetch('/api/fund-rent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            accountAddress: potPda.toBase58(),
                            rentAmount: rentExemptAmount,
                        }),
                    });

                    if (!fundRentResponse.ok) {
                        const errorData = await fundRentResponse.json();
                        console.warn(`Failed to fund rent: ${errorData.error || 'Unknown error'}`);
                        // Continue anyway - Anchor's init constraint will handle rent
                    } else {
                        const fundData = await fundRentResponse.json();
                        console.log('Rent funded from treasury:', fundData.signature);
                        // Wait a moment for the rent transfer to confirm
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (fundError: any) {
                    console.warn('Treasury funding skipped or failed, proceeding with user funds:', fundError.message);
                    // Continue - Anchor's init constraint will handle rent if needed
                }
            }

            // 5. Setup Anchor Provider (with proper wallet casting to prevent _bn error)
            const provider = new AnchorProvider(connection, (wallet as any), {
                commitment: 'confirmed',
            });
            
            // 5.1. Create Program - IDL now has metadata.address set, so it works correctly
            const program = new Program(idlWithAddress as any, provider);

            // 6. Build the Instruction using Anchor's .transaction() method
            // This auto-resolves all accounts including potAta, mint, tokenProgram, etc.
            console.log('🔍 CRITICAL CHECK before program.methods:', {
                potPda: potPda?.toBase58(),
                userPubKey: userPubKey?.toBase58(),
                potAta: potAta?.toBase58(),
                CADPAY_MINT: CADPAY_MINT?.toBase58(),
            });

            const anchorTx = await program.methods
                .createSavingsPot(name, new BN(unlockTimeInt))
                .accounts({
                    savingsPot: potPda,
                    user: userPubKey,
                    systemProgram: SystemProgram.programId,
                    potAta: potAta,
                    mint: CADPAY_MINT,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                } as any)
                .transaction();

            if (anchorTx.instructions.length === 0) {
                throw new Error('Anchor transaction has no instructions');
            }

            // 7. Convert all Anchor instructions to plain TransactionInstructions for Lazorkit
            // Account creation may generate multiple instructions (e.g., ATA creation + program call)
            const plainInstructions = anchorTx.instructions.map((instruction) => {
                // Recreate all PublicKeys from base58 to avoid internal reference issues
                const validatedKeys = instruction.keys.map((key) => {
                    if (!key || !key.pubkey) {
                        throw new Error('Invalid instruction key');
                    }
                    
                    // Get address string
                    const pubkeyAddress = key.pubkey instanceof PublicKey 
                        ? key.pubkey.toBase58() 
                        : String(key.pubkey);
                    
                    // Create fresh PublicKey
                    return {
                        pubkey: new PublicKey(pubkeyAddress),
                        isSigner: key.isSigner || false,
                        isWritable: key.isWritable || false,
                    };
                });

                // Extract programId safely
                let programId: PublicKey;
                if (instruction.programId instanceof PublicKey) {
                    programId = instruction.programId;
                } else {
                    // Handle case where programId might be a different type
                    const programIdStr = typeof instruction.programId === 'string' 
                        ? instruction.programId 
                        : String(instruction.programId);
                    programId = new PublicKey(programIdStr);
                }

                const data = Buffer.isBuffer(instruction.data)
                    ? instruction.data
                    : Buffer.from(instruction.data as any);

                return new TransactionInstruction({
                    programId: programId,
                    keys: validatedKeys,
                    data: data,
                });
            });

            // 8. Execute via Lazorkit's instruction-based API (requires user authentication)
            showToast('Creating savings pot... Please authenticate', 'info');
            
            const signature = await signAndSendTransaction({
                instructions: plainInstructions,
                transactionOptions: {
                    computeUnitLimit: 400_000, // Sufficient for account creation
                }
            });

            // 9. Wait for confirmation
            try {
                await connection.confirmTransaction(signature, 'confirmed');
            } catch (confirmError) {
                // Transaction might still be processing
                console.log('Transaction confirmation:', confirmError);
            }

            // 10. Update Local Storage for metadata
            const potData = { 
                name, 
                unlockTime: unlockTimeInt, 
                address: potPda.toBase58(), 
                createdTx: signature 
            };
            const existingMeta = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
            const updatedMeta = [...existingMeta.filter((p: any) => p.name !== name), potData];
            localStorage.setItem(`savings_pots_${address}`, JSON.stringify(updatedMeta));

            // 11. Refresh pots and show success
            await fetchPots();
            showToast(`Savings pot "${name}" created successfully!`, 'success');
            return signature;

        } catch (error: any) {
            console.error("Failed to create pot:", error);
            showToast(`Failed to create savings pot: ${error.message}`, 'error');
            throw error;
        } finally {
            setLocalLoading(false);
        }
    }, [address, wallet, signAndSendTransaction, connection, fetchPots, showToast]);

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
