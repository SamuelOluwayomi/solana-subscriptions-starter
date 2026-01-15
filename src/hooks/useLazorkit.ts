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
        // Validate wallet connection first with detailed error messages
        if (!address) {
            throw new Error("Wallet address is not available. Please connect your wallet.");
        }
        if (!signAndSendTransaction) {
            throw new Error("Wallet signer is not available. Please connect your wallet.");
        }
        if (!wallet) {
            console.error("DEBUG: Wallet object is undefined. Available from useLazorkit:", {
                address: !!address,
                signAndSendTransaction: !!signAndSendTransaction,
                wallet: !!wallet,
                connection: !!connection,
            });
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

        try {
            // Validate and convert unlockTime to a valid number
            if (unlockTime === undefined || unlockTime === null || isNaN(unlockTime) || unlockTime <= 0) {
                throw new Error(`Invalid unlock time: ${unlockTime}. Must be a positive Unix timestamp.`);
            }

            // Ensure unlockTime is an integer
            const unlockTimeInt = Math.floor(Number(unlockTime));
            if (!Number.isFinite(unlockTimeInt) || unlockTimeInt <= 0) {
                throw new Error(`Invalid unlock time conversion: ${unlockTime} -> ${unlockTimeInt}`);
            }

            // Import required modules
            const { AnchorProvider, Program, BN } = await import('@coral-xyz/anchor');
            const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
            const cadpayTokenModule = await import('@/utils/cadpayToken');
            const idl = await import('../../anchor/target/idl/cadpay_profiles.json');

            // Validate address is a valid string before creating PublicKey
            if (!address || typeof address !== 'string' || address.length === 0) {
                throw new Error(`Invalid wallet address: ${address}`);
            }

            // Create user PublicKey with validation
            let userPubkey: PublicKey;
            try {
                userPubkey = new PublicKey(address);
            } catch (e: any) {
                throw new Error(`Invalid wallet address format: ${address}. Error: ${e.message}`);
            }

            // Ensure CADPAY_MINT is a PublicKey instance
            const CADPAY_MINT = cadpayTokenModule.CADPAY_MINT;
            if (!CADPAY_MINT) {
                throw new Error('CADPAY_MINT is not defined in cadpayToken module');
            }
            
            let mintPubkey: PublicKey;
            try {
                mintPubkey = CADPAY_MINT instanceof PublicKey ? CADPAY_MINT : new PublicKey(CADPAY_MINT);
            } catch (e: any) {
                throw new Error(`Invalid CADPAY_MINT: ${CADPAY_MINT}. Error: ${e.message}`);
            }

            // Derive PDA with validated inputs
            if (!name || name.trim().length === 0) {
                throw new Error('Pot name cannot be empty for PDA derivation');
            }
            
            let savingsPotPDA: PublicKey;
            let bump: number;
            try {
                [savingsPotPDA, bump] = deriveSavingsPotPDA(userPubkey, name);
                if (!savingsPotPDA) {
                    throw new Error('Failed to derive savings pot PDA - result is undefined');
                }
            } catch (e: any) {
                throw new Error(`Failed to derive savings pot PDA for name "${name}": ${e.message}`);
            }

            // Validate connection
            if (!connection) {
                throw new Error('Solana connection is not available');
            }

            // Create Anchor provider and program
            if (!wallet) {
                throw new Error('Wallet object is required for Anchor provider');
            }

            // Create a wallet adapter that Anchor expects
            // Anchor expects wallet with publicKey and signTransaction methods
            const anchorWallet = {
                publicKey: userPubkey,
                signTransaction: async (tx: Transaction) => {
                    // Use Lazorkit's signAndSendTransaction but we need to sign without sending
                    // For now, we'll use the wallet's signTransaction if available
                    if (wallet && typeof (wallet as any).signTransaction === 'function') {
                        return await (wallet as any).signTransaction(tx);
                    }
                    // Fallback: return the transaction as-is (Lazorkit will handle signing)
                    return tx;
                },
                signAllTransactions: async (txs: Transaction[]) => {
                    if (wallet && typeof (wallet as any).signAllTransactions === 'function') {
                        return await (wallet as any).signAllTransactions(txs);
                    }
                    return txs;
                }
            };
            
            const provider = new AnchorProvider(connection, anchorWallet as any, {});
            if (!provider) {
                throw new Error('Failed to create Anchor provider');
            }

            const program = new Program(idl as any, provider);
            if (!program) {
                throw new Error('Failed to create Anchor program');
            }

            // Derive pot ATA (will be created by Anchor's init constraint)
            let potAta: PublicKey;
            try {
                potAta = await getAssociatedTokenAddress(mintPubkey, savingsPotPDA, true);
                if (!potAta) {
                    throw new Error('getAssociatedTokenAddress returned undefined');
                }
            } catch (e: any) {
                throw new Error(`Failed to derive pot ATA: ${e.message}`);
            }

            // Validate name
            if (!name || typeof name !== 'string' || name.length === 0 || name.length > 32) {
                throw new Error(`Invalid pot name: "${name}". Must be a non-empty string up to 32 characters.`);
            }

            // Create BN for unlockTime using the BN imported from Anchor above (line 266)
            let unlockTimeBN;
            try {
                // Convert to string first for maximum compatibility
                const unlockTimeStr = unlockTimeInt.toString();
                unlockTimeBN = new BN(unlockTimeStr);
                
                // Verify BN is valid
                if (!unlockTimeBN) {
                    throw new Error(`BN is null or undefined`);
                }
                
                // Verify it has the _bn property that Anchor uses internally
                if ((unlockTimeBN as any)._bn === undefined) {
                    // Try with number as fallback
                    unlockTimeBN = new BN(unlockTimeInt);
                    if (!unlockTimeBN || (unlockTimeBN as any)._bn === undefined) {
                        throw new Error(`Failed to create valid Anchor BN from unlockTime: ${unlockTimeInt}`);
                    }
                }
                
                // Final validation - ensure BN can be converted to string
                const testStr = unlockTimeBN.toString();
                if (!testStr || testStr === 'NaN') {
                    throw new Error(`BN created but invalid: ${testStr}`);
                }
            } catch (bnError: any) {
                throw new Error(`Failed to create BN for unlockTime: ${bnError?.message || 'Unknown error'}. unlockTimeInt=${unlockTimeInt}, type=${typeof unlockTimeInt}`);
            }

            // Validate all accounts before creating instruction
            if (!savingsPotPDA) {
                throw new Error('Failed to derive savings pot PDA');
            }
            if (!potAta) {
                throw new Error('Failed to derive pot ATA');
            }
            if (!mintPubkey) {
                throw new Error('CADPAY_MINT is not defined');
            }
            if (!userPubkey) {
                throw new Error('User public key is invalid');
            }

            // Ensure all PublicKey objects are valid instances
            const accountsToValidate: Record<string, PublicKey> = {
                savingsPot: savingsPotPDA,
                potAta: potAta,
                mint: mintPubkey,
                user: userPubkey,
                systemProgram: SystemProgram.programId,
            };

            // Validate each account is a valid PublicKey
            for (const [key, value] of Object.entries(accountsToValidate)) {
                if (value === undefined || value === null) {
                    throw new Error(`Account ${key} is undefined or null`);
                }
                if (!(value instanceof PublicKey)) {
                    throw new Error(`Account ${key} is not a PublicKey instance. Got: ${typeof value}, value: ${value}`);
                }
                // Verify the PublicKey is valid by checking it has a toBase58 method
                try {
                    const address = value.toBase58();
                    if (!address || address.length === 0) {
                        throw new Error(`Account ${key} has invalid address`);
                    }
                } catch (e: any) {
                    throw new Error(`Account ${key} is not a valid PublicKey: ${e.message}`);
                }
            }

            // Validate program IDs
            if (!TOKEN_PROGRAM_ID || !(TOKEN_PROGRAM_ID instanceof PublicKey)) {
                throw new Error('TOKEN_PROGRAM_ID is not a valid PublicKey');
            }
            if (!ASSOCIATED_TOKEN_PROGRAM_ID || !(ASSOCIATED_TOKEN_PROGRAM_ID instanceof PublicKey)) {
                throw new Error('ASSOCIATED_TOKEN_PROGRAM_ID is not a valid PublicKey');
            }
            if (!SystemProgram.programId || !(SystemProgram.programId instanceof PublicKey)) {
                throw new Error('SystemProgram.programId is not a valid PublicKey');
            }
            if (!SYSVAR_RENT_PUBKEY || !(SYSVAR_RENT_PUBKEY instanceof PublicKey)) {
                throw new Error('SYSVAR_RENT_PUBKEY is not a valid PublicKey');
            }

            // Step 1: Fund rent from treasury (if needed)
            // Check if the PDA account already exists or needs rent
            const potAccountInfo = await connection.getAccountInfo(savingsPotPDA);
            const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(
                8 + 32 + (4 + 32) + 8 + 8 + 8 + 1 // SavingsPot account size
            );

            if (!potAccountInfo || potAccountInfo.lamports < rentExemptAmount) {
                showToast('Funding rent for savings pot from treasury...', 'info');
                try {
                    // Call API to fund rent from treasury
                    const fundRentResponse = await fetch('/api/fund-rent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            accountAddress: savingsPotPDA.toBase58(),
                            rentAmount: rentExemptAmount,
                        }),
                    });

                    if (!fundRentResponse.ok) {
                        const errorData = await fundRentResponse.json();
                        throw new Error(`Failed to fund rent: ${errorData.error || 'Unknown error'}`);
                    }

                    const fundData = await fundRentResponse.json();
                    console.log('Rent funded:', fundData.signature);
                    
                    // Wait a moment for the rent transfer to confirm
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (fundError: any) {
                    console.warn('Failed to fund rent from treasury, proceeding anyway:', fundError.message);
                    // Continue - Anchor's init constraint will handle rent if needed
                }
            }

            // Step 2: Create instruction using Anchor
            let instruction: TransactionInstruction;
            
            try {
                // Final validation - ensure every account is a valid PublicKey before passing to Anchor
                const allAccounts = {
                    savingsPot: savingsPotPDA,
                    user: userPubkey,
                    systemProgram: SystemProgram.programId,
                    potAta: potAta,
                    mint: mintPubkey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                };

                // Double-check every account is a PublicKey instance
                for (const [key, value] of Object.entries(allAccounts)) {
                    if (value === undefined || value === null) {
                        throw new Error(`Account ${key} is undefined or null before passing to Anchor`);
                    }
                    if (!(value instanceof PublicKey)) {
                        throw new Error(`Account ${key} is not a PublicKey instance. Type: ${typeof value}, Value: ${value}`);
                    }
                }

                // Create instruction using Anchor's method builder
                // Use .transaction() first to let Anchor handle all account resolution
                try {
                    // Try .transaction() first as it handles account resolution better
                    const anchorTx = await program.methods
                        .createSavingsPot(name, unlockTimeBN)
                        .accounts({
                            savingsPot: savingsPotPDA,
                            user: userPubkey,
                            systemProgram: SystemProgram.programId,
                            potAta: potAta,
                            mint: mintPubkey,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                            rent: SYSVAR_RENT_PUBKEY,
                        } as any)
                        .transaction();
                    
                    if (anchorTx.instructions.length === 0) {
                        throw new Error('Anchor transaction has no instructions');
                    }
                    instruction = anchorTx.instructions[0];
                } catch (txError: any) {
                    // Fallback to .instruction() if .transaction() fails
                    console.warn('Anchor .transaction() failed, trying .instruction() instead:', txError.message);
                    instruction = await program.methods
                        .createSavingsPot(name, unlockTimeBN)
                        .accounts({
                            savingsPot: savingsPotPDA,
                            user: userPubkey,
                            systemProgram: SystemProgram.programId,
                            potAta: potAta,
                            mint: mintPubkey,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                            rent: SYSVAR_RENT_PUBKEY,
                        } as any)
                        .instruction();
                }
            } catch (methodError: any) {
                console.error('Anchor method call failed:', {
                    name,
                    unlockTimeBN: unlockTimeBN?.toString(),
                    error: methodError?.message,
                    errorStack: methodError?.stack
                });
                throw new Error(`Failed to create instruction: ${methodError?.message || 'Unknown error'}`);
            }

            // Step 3: Convert Anchor instruction to plain TransactionInstruction for Lazorkit
            // Lazorkit needs a plain TransactionInstruction, not Anchor's internal instruction format
            // Validate all keys are valid PublicKeys before conversion
            
            // Debug: Log instruction details before conversion
            console.log('Instruction before conversion:', {
                programId: instruction.programId?.toBase58(),
                keysCount: instruction.keys?.length,
                dataLength: instruction.data?.length,
                keys: instruction.keys?.map((k, i) => ({
                    index: i,
                    pubkey: k.pubkey?.toBase58(),
                    isSigner: k.isSigner,
                    isWritable: k.isWritable,
                    pubkeyType: k.pubkey?.constructor?.name,
                }))
            });

            // Validate instruction structure
            if (!instruction) {
                throw new Error('Instruction is undefined');
            }

            if (!instruction.keys || !Array.isArray(instruction.keys)) {
                throw new Error('Instruction keys is not an array');
            }

            if (instruction.keys.length === 0) {
                throw new Error('Instruction has no keys');
            }

            // Validate and convert each key
            // IMPORTANT: Recreate all PublicKeys from base58 strings to avoid internal reference issues
            const validatedKeys = instruction.keys.map((key, index) => {
                if (!key) {
                    throw new Error(`Key at index ${index} is undefined`);
                }
                
                if (!key.pubkey) {
                    throw new Error(`Key at index ${index} has undefined pubkey`);
                }

                // Always recreate PublicKey from base58 string to ensure clean object
                // This avoids issues with internal references that Lazorkit can't serialize
                let pubkeyAddress: string;
                try {
                    if (key.pubkey instanceof PublicKey) {
                        pubkeyAddress = key.pubkey.toBase58();
                    } else if (typeof key.pubkey === 'string') {
                        pubkeyAddress = key.pubkey;
                    } else {
                        throw new Error(`Invalid pubkey type: ${typeof key.pubkey}`);
                    }
                } catch (e: any) {
                    throw new Error(`Key at index ${index} cannot be converted to address: ${e.message}`);
                }

                // Create a fresh PublicKey from the address string
                let pubkey: PublicKey;
                try {
                    pubkey = new PublicKey(pubkeyAddress);
                } catch (e: any) {
                    throw new Error(`Key at index ${index} has invalid pubkey address: ${pubkeyAddress}. Error: ${e.message}`);
                }

                // Verify the PublicKey is valid
                try {
                    const address = pubkey.toBase58();
                    if (!address || address.length === 0) {
                        throw new Error(`Key at index ${index} has empty address`);
                    }
                } catch (e: any) {
                    throw new Error(`Key at index ${index} is not a valid PublicKey: ${e.message}`);
                }

                return {
                    pubkey: pubkey,
                    isSigner: key.isSigner || false,
                    isWritable: key.isWritable || false,
                };
            });

            // Validate programId - Always recreate from base58 to ensure clean object
            if (!instruction.programId) {
                throw new Error('Instruction programId is undefined');
            }

            let programIdAddress: string;
            try {
                if (instruction.programId instanceof PublicKey) {
                    programIdAddress = instruction.programId.toBase58();
                } else if (typeof instruction.programId === 'string') {
                    programIdAddress = instruction.programId;
                } else {
                    throw new Error(`Invalid programId type: ${typeof instruction.programId}`);
                }
            } catch (e: any) {
                throw new Error(`Cannot convert programId to address: ${e.message}`);
            }

            let programId: PublicKey;
            try {
                programId = new PublicKey(programIdAddress);
            } catch (e: any) {
                throw new Error(`Invalid programId address: ${programIdAddress}. Error: ${e.message}`);
            }

            // Validate data
            if (!instruction.data) {
                throw new Error('Instruction data is undefined');
            }

            let data: Buffer;
            if (Buffer.isBuffer(instruction.data)) {
                data = instruction.data;
            } else {
                // Try to convert to Buffer (handles Uint8Array, Array, etc.)
                try {
                    data = Buffer.from(instruction.data as any);
                } catch (e: any) {
                    throw new Error(`Invalid instruction data type: ${typeof instruction.data}. Cannot convert to Buffer: ${e.message}`);
                }
            }

            // Create plain instruction
            const plainInstruction = new TransactionInstruction({
                programId: programId,
                keys: validatedKeys,
                data: data,
            });

            // Final validation of the plain instruction
            console.log('Plain instruction created:', {
                programId: plainInstruction.programId.toBase58(),
                keysCount: plainInstruction.keys.length,
                dataLength: plainInstruction.data.length,
                allKeysValid: plainInstruction.keys.every(k => k.pubkey instanceof PublicKey),
            });

            // Double-check: Ensure no undefined values in the instruction
            if (!plainInstruction.programId || !(plainInstruction.programId instanceof PublicKey)) {
                throw new Error('Plain instruction has invalid programId');
            }
            
            for (let i = 0; i < plainInstruction.keys.length; i++) {
                const key = plainInstruction.keys[i];
                if (!key || !key.pubkey || !(key.pubkey instanceof PublicKey)) {
                    throw new Error(`Plain instruction key at index ${i} is invalid`);
                }
                // Ensure the PublicKey is fully constructed
                try {
                    key.pubkey.toBase58();
                } catch (e: any) {
                    throw new Error(`Plain instruction key at index ${i} has invalid PublicKey: ${e.message}`);
                }
            }

            // Step 4: Use Lazorkit's instruction-based API to create the account
            // This requires user authentication via Lazorkit
            showToast('Creating savings pot... Please authenticate', 'info');
            
            try {
                const signature = await signAndSendTransaction({
                    instructions: [plainInstruction],
                    transactionOptions: {
                        computeUnitLimit: 400_000, // Sufficient for account creation
                    }
                });
                return signature;
            } catch (lazorkitError: any) {
                // Enhanced error logging for Lazorkit errors
                console.error('Lazorkit signAndSendTransaction failed:', {
                    error: lazorkitError,
                    message: lazorkitError?.message,
                    stack: lazorkitError?.stack,
                    instruction: {
                        programId: plainInstruction.programId.toBase58(),
                        keysCount: plainInstruction.keys.length,
                        keys: plainInstruction.keys.map((k, i) => ({
                            index: i,
                            pubkey: k.pubkey.toBase58(),
                            isSigner: k.isSigner,
                            isWritable: k.isWritable,
                        })),
                    }
                });
                throw new Error(`Lazorkit transaction failed: ${lazorkitError?.message || 'Unknown error'}`);
            }

                // Wait for confirmation
                try {
                    await connection.confirmTransaction(signature, 'confirmed');
                } catch (confirmError) {
                    // Transaction might still be processing
                    console.log('Transaction confirmation:', confirmError);
                }

                // Store pot metadata locally for quick lookup
                const potData = { name, unlockTime, address: savingsPotPDA.toBase58(), createdTx: signature };
                const existing = JSON.parse(localStorage.getItem(`savings_pots_${address}`) || '[]');
                localStorage.setItem(`savings_pots_${address}`, JSON.stringify([...existing, potData]));

                await fetchPots();
                showToast(`Savings pot "${name}" created successfully!`, 'success');
                return signature;
        } catch (error: any) {
            console.error("Failed to create pot:", error);
            showToast(`Failed to create savings pot: ${error.message}`, 'error');
            throw error;
        }
    }, [address, signAndSendTransaction, connection, fetchPots, showToast, wallet]);

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
