import { useEffect, useState, useMemo } from 'react';
import { useWallet } from '@lazorkit/wallet';
import * as anchor from '@coral-xyz/anchor';
import { Program, Idl } from '@coral-xyz/anchor';

// Use anchor.web3 instead of root web3 to avoid 'instanceof' / version mismatch errors
const { Connection, PublicKey, SystemProgram, Transaction } = anchor.web3;

const PROGRAM_ID_STR = "6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz";
const DEVNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

const IDL: Idl = {
    "version": "0.1.0",
    "name": "cadpay_profiles",
    "address": PROGRAM_ID_STR,
    "instructions": [
        {
            "name": "initialize_user",
            "discriminator": [111, 17, 185, 250, 60, 122, 38, 254],
            "accounts": [
                { "name": "userProfile", "writable": true, "signer": false },
                { "name": "user", "writable": true, "signer": true },
                { "name": "systemProgram", "writable": false, "signer": false }
            ],
            "args": [
                { "name": "username", "type": { "array": ["u8", 16] } },
                { "name": "emoji", "type": { "array": ["u8", 4] } },
                { "name": "gender", "type": { "array": ["u8", 8] } },
                { "name": "pin", "type": { "array": ["u8", 4] } }
            ]
        },
        {
            "name": "update_user",
            "discriminator": [9, 2, 160, 169, 118, 12, 207, 84],
            "accounts": [
                { "name": "userProfile", "writable": true, "signer": false },
                { "name": "user", "writable": false, "signer": true },
                { "name": "authority", "writable": false, "signer": true }
            ],
            "args": [
                { "name": "username", "type": { "array": ["u8", 16] } },
                { "name": "emoji", "type": { "array": ["u8", 4] } },
                { "name": "gender", "type": { "array": ["u8", 8] } },
                { "name": "pin", "type": { "array": ["u8", 4] } }
            ]
        }
    ],
    "accounts": [
        {
            "name": "UserProfile",
            "discriminator": [200, 150, 26, 17, 30, 100, 50, 10]
        }
    ],
    "types": [
        {
            "name": "UserProfile",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "authority", "type": "pubkey" },
                    { "name": "username", "type": { "array": ["u8", 16] } },
                    { "name": "emoji", "type": { "array": ["u8", 4] } },
                    { "name": "gender", "type": { "array": ["u8", 8] } },
                    { "name": "pin", "type": { "array": ["u8", 4] } }
                ]
            }
        }
    ]
} as any;

export interface UserProfile {
    username: string;
    emoji: string;
    gender: string;
    pin: string;
    authority: anchor.web3.PublicKey;
}

export function useUserProfile() {
    // @ts-ignore
    const { smartWalletPubkey, signAndSendTransaction, connection: lazorkitConnection } = useWallet();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true); // Start as true to prevent flicker
    const [error, setError] = useState<string | null>(null);

    // Initial persistence sync
    useEffect(() => {
        if (smartWalletPubkey) {
            const saved = localStorage.getItem(`cadpay_profile_exists_${smartWalletPubkey.toString()}`);
            if (saved === 'true') {
                // We strongly suspect a profile exists, stay in loading state until fetch confirms it
                setLoading(true);
            } else {
                // No local record, but we still need to check once
                setLoading(true);
            }
        } else {
            setLoading(false);
            setProfile(null);
        }
    }, [smartWalletPubkey?.toString()]);

    const connection = useMemo(() => {
        if (lazorkitConnection) return lazorkitConnection;
        return new Connection(DEVNET_RPC, 'confirmed');
    }, [lazorkitConnection?.rpcEndpoint]);

    const program = useMemo(() => {
        if (!connection || !smartWalletPubkey) return null;
        try {
            const anchorWalletPubkey = new PublicKey(smartWalletPubkey.toString());
            const wallet = {
                publicKey: anchorWalletPubkey,
                signTransaction: async (tx: any) => tx,
                signAllTransactions: async (txs: any[]) => txs,
            };
            const provider = new anchor.AnchorProvider(connection, wallet as any, { preflightCommitment: 'confirmed' });
            return new Program(IDL, provider);
        } catch (e) {
            console.error("useUserProfile: Failed to init program", e);
            return null;
        }
    }, [connection, smartWalletPubkey?.toString()]);

    const decodeString = (bytes: number[]) => {
        return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, '');
    };

    const encodeString = (str: string, length: number) => {
        const arr = new Uint8Array(length);
        const bytes = new TextEncoder().encode(str);
        arr.set(bytes.slice(0, length));
        return Array.from(arr);
    };

    const checkAndAirdrop = async (address: anchor.web3.PublicKey) => {
        try {
            const balance = await connection.getBalance(address);
            if (balance < 0.02 * anchor.web3.LAMPORTS_PER_SOL) {
                console.log("Auto-airdrop starting for:", address.toString());
                const signature = await connection.requestAirdrop(address, 1 * anchor.web3.LAMPORTS_PER_SOL);
                await connection.confirmTransaction(signature);
                console.log("Auto-airdrop successful");
            }
        } catch (err) {
            console.warn("Airdrop rate limit hit. Please fund manually if needed.");
        }
    };

    const fetchProfile = async () => {
        if (!smartWalletPubkey || !program) return;
        setLoading(true);
        try {
            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile-v1"), new PublicKey(smartWalletPubkey.toString()).toBuffer()],
                new PublicKey(PROGRAM_ID_STR)
            );

            // @ts-ignore
            const account = await program.account.userProfile.fetchNullable(profilePda);
            if (account) {
                const decodedProfile = {
                    username: decodeString(account.username as number[]),
                    emoji: decodeString(account.emoji as number[]),
                    gender: decodeString(account.gender as number[]),
                    pin: decodeString(account.pin as number[]),
                    authority: account.authority as anchor.web3.PublicKey
                };
                setProfile(decodedProfile);
                localStorage.setItem(`cadpay_profile_exists_${smartWalletPubkey.toString()}`, 'true');
            } else {
                setProfile(null);
                localStorage.removeItem(`cadpay_profile_exists_${smartWalletPubkey.toString()}`);
            }
        } catch (err: any) {
            if (err.message.includes("discriminator") || err.message.includes("Account does not exist")) {
                setProfile(null);
            } else {
                console.error("Failed to fetch profile:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const createProfile = async (username: string, emoji: string, gender: string, pin: string) => {
        if (!smartWalletPubkey || !program) throw new Error("Wallet not connected");
        setLoading(true);
        setError(null);
        try {
            const userPubkey = new PublicKey(smartWalletPubkey.toString());
            await checkAndAirdrop(userPubkey);

            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile-v1"), userPubkey.toBuffer()],
                new PublicKey(PROGRAM_ID_STR)
            );

            // Prefer Anchor's fetchNullable to reliably detect existing PDA
            try {
                // @ts-ignore
                const existing = await program.account.userProfile.fetchNullable(profilePda);
                if (existing) {
                    // If a profile already exists, call update flow instead of init
                    return await updateProfile(username, emoji, gender, pin);
                }
            } catch (e) {
                // If fetchNullable fails for an unexpected reason, log and continue
                console.warn('Could not fetch profile account; proceeding to initialize', e);
            }

            // Convert strings to fixed-size byte arrays for MAXIMUM TRANSCTION COMPRESSION
            const usernameBytes = encodeString(username, 16);
            const emojiBytes = encodeString(emoji, 4);
            const genderBytes = encodeString(gender, 8);
            const pinBytes = encodeString(pin, 4);

            const instruction = await program.methods
                .initializeUser(usernameBytes, emojiBytes, genderBytes, pinBytes)
                .accounts({
                    userProfile: profilePda,
                    user: userPubkey,
                    systemProgram: SystemProgram.programId,
                } as any)
                .instruction();

            const tx = new Transaction().add(instruction);
            tx.feePayer = userPubkey;
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            const signature = await signAndSendTransaction(tx);
            console.log("Transaction sent, awaiting confirmation...", signature);

            // Set local flag immediately for optimistic UX
            localStorage.setItem(`cadpay_profile_exists_${smartWalletPubkey.toString()}`, 'true');

            // Try to confirm the signature and poll for PDA existence before returning
            try {
                // Attempt RPC confirmation (may fail depending on provider)
                await connection.confirmTransaction(signature, 'confirmed');
            } catch (e) {
                // ignore - some providers (or Lazorkit) may not support this exact call
            }

            // Poll transaction status + account presence for up to ~30 seconds
            const maxAttempts = 15;
            let found = false;
            for (let i = 0; i < maxAttempts; i++) {
                try {
                    // First, check transaction status/logs
                    const tx = await connection.getTransaction(signature, { commitment: 'confirmed' });
                    if (tx) {
                        if (tx.meta && tx.meta.err) {
                            // Transaction failed on-chain
                            throw new Error('Transaction failed: ' + JSON.stringify(tx.meta.err));
                        }
                        // If transaction confirmed, check account existence
                        // @ts-ignore
                        const existing = await program.account.userProfile.fetchNullable(profilePda);
                        if (existing) {
                            found = true;
                            break;
                        }
                    }
                } catch (e) {
                    // if the error was transaction failure, rethrow
                    if (e && (e.message || '').includes('Transaction failed')) {
                        console.error('Transaction reported failed on-chain', e);
                        throw e;
                    }
                    // otherwise ignore and continue polling
                }
                // backoff delay
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (!found) {
                console.warn('Profile not visible on-chain after waiting; you may need to refresh or check RPC health');
            }

            // Refresh local cache
            await fetchProfile();
            return signature;
        } catch (err: any) {
            console.error("Error creating profile:", err);
            setError(err.message || "Failed to create profile");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (username: string, emoji: string, gender: string, pin: string) => {
        if (!smartWalletPubkey || !program) throw new Error("Wallet not connected");
        setLoading(true);
        try {
            const userPubkey = new PublicKey(smartWalletPubkey.toString());
            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile-v1"), userPubkey.toBuffer()],
                new PublicKey(PROGRAM_ID_STR)
            );

            const usernameBytes = encodeString(username, 16);
            const emojiBytes = encodeString(emoji, 4);
            const genderBytes = encodeString(gender, 8);
            const pinBytes = encodeString(pin, 4);

            const instruction = await program.methods
                .updateUser(usernameBytes, emojiBytes, genderBytes, pinBytes)
                .accounts({
                    userProfile: profilePda,
                    user: userPubkey,
                    authority: userPubkey
                } as any)
                .instruction();

            const tx = new Transaction().add(instruction);
            tx.feePayer = userPubkey;
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            await signAndSendTransaction(tx);
            await fetchProfile();
        } catch (err: any) {
            console.error("Error updating profile:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (smartWalletPubkey && program) {
            fetchProfile();
        } else if (!smartWalletPubkey) {
            setProfile(null);
        }
    }, [smartWalletPubkey?.toString(), !!program]);

    return {
        profile,
        loading,
        error,
        createProfile,
        updateProfile,
        fetchProfile
    };
}
