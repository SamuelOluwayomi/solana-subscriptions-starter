import { useEffect, useState, useMemo } from 'react';
import { useWallet } from '@lazorkit/wallet';
import * as anchor from '@coral-xyz/anchor';
import { Program, Idl } from '@coral-xyz/anchor';

// Use anchor.web3 instead of root web3 to avoid 'instanceof' / version mismatch errors
const { Connection, PublicKey, SystemProgram, Transaction } = anchor.web3;

const PROGRAM_ID_STR = "6VvJbGzNHbtZLWxmLTYPpRz2F3oMDxdL1YRgV3b51Ccz";
const DEVNET_RPC = 'https://api.devnet.solana.com';

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
                { "name": "username", "type": "string" },
                { "name": "emoji", "type": "string" },
                { "name": "gender", "type": "string" },
                { "name": "pin", "type": "string" }
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
                { "name": "username", "type": "string" },
                { "name": "emoji", "type": "string" },
                { "name": "gender", "type": "string" },
                { "name": "pin", "type": "string" }
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
                    { "name": "username", "type": "string" },
                    { "name": "emoji", "type": "string" },
                    { "name": "gender", "type": "string" },
                    { "name": "pin", "type": "string" }
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
    // @ts-ignore - 'connection' might not be exposed in all wallet adapter versions, fallback handled below
    const { smartWalletPubkey, signAndSendTransaction, connection: lazorkitConnection } = useWallet();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. STABILIZE THE CONNECTION
    const connection = useMemo(() => {
        if (lazorkitConnection) return lazorkitConnection;
        return new Connection(DEVNET_RPC, 'confirmed');
    }, [lazorkitConnection?.rpcEndpoint]);

    // 2. STABILIZE THE PROGRAM
    const program = useMemo(() => {
        if (!connection || !smartWalletPubkey) return null;

        try {
            const anchorWalletPubkey = new PublicKey(smartWalletPubkey.toString());

            const wallet = {
                publicKey: anchorWalletPubkey,
                signTransaction: async (tx: any) => tx,
                signAllTransactions: async (txs: any[]) => txs,
            };

            const provider = new anchor.AnchorProvider(
                connection,
                wallet as any,
                { preflightCommitment: 'confirmed' }
            );

            const prog = new Program(IDL, provider);
            console.log("useUserProfile: Program initialized successfully with v0.30+ IDL");
            return prog;
        } catch (e) {
            console.error("useUserProfile: Failed to init program", e);
            return null;
        }
    }, [connection, smartWalletPubkey?.toString()]);

    const checkAndAirdrop = async (address: anchor.web3.PublicKey) => {
        try {
            const balance = await connection.getBalance(address);
            console.log(`Current balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

            if (balance < 0.02 * anchor.web3.LAMPORTS_PER_SOL) {
                console.log("Balance low, requesting airdrop...");
                const signature = await connection.requestAirdrop(address, 1 * anchor.web3.LAMPORTS_PER_SOL);
                await connection.confirmTransaction(signature);
                console.log("Airdrop confirmed!");
            }
        } catch (err) {
            console.warn("Airdrop failed (rate limited?), continuing with current balance...", err);
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
                setProfile({
                    username: account.username as string,
                    emoji: account.emoji as string,
                    gender: account.gender as string,
                    pin: account.pin as string,
                    authority: account.authority as anchor.web3.PublicKey
                });
            } else {
                setProfile(null);
            }
        } catch (err: any) {
            // If the account has the wrong data (discriminator error) or doesn't exist,
            // we treat it as if the profile doesn't exist yet.
            const errMsg = err.message || "";
            if (errMsg.includes("account discriminator") || errMsg.includes("Account does not exist")) {
                console.warn("Profile not initialized correctly or doesn't exist. Showing onboarding.");
                setProfile(null);
            } else {
                console.error("Failed to fetch profile:", err);
                setError("Failed to load profile");
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
            console.log("Creating profile for:", userPubkey.toString());

            await checkAndAirdrop(userPubkey);

            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile-v1"), userPubkey.toBuffer()],
                new PublicKey(PROGRAM_ID_STR)
            );

            // 1. Check if ANY account exists at this PDA
            const accountInfo = await connection.getAccountInfo(profilePda);
            if (accountInfo !== null) {
                try {
                    // Try to fetch it to see if it's VALID
                    // @ts-ignore
                    const validAccount = await program.account.userProfile.fetchNullable(profilePda);
                    if (validAccount) {
                        console.log("Valid profile exists! Switching to updateProfile.");
                        return await updateProfile(username, emoji, gender, pin);
                    }
                } catch (e) {
                    console.warn("Account exists but is INVALID (Zombie). Attempting to re-initialize...");
                    // Note: This might still fail if Rust's 'init' check sees any lamports > 0.
                    // If it fails, the user will need a new Program ID or different Seed.
                }
            }

            console.log("Profile not found. Initializing new account at PDA:", profilePda.toString());

            const instruction = await program.methods
                .initializeUser(username, emoji, gender, pin)
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

            // Disable sponsorship to save 100+ bytes and fix "Transaction too large"
            // Since we have SOL from airdrop, we don't need the Paymaster overhead
            // @ts-ignore
            const signature = await signAndSendTransaction(tx, { sponsor: false });
            console.log("Profile created successfully! Signature:", signature);
            setProfile({ username, emoji, gender, pin, authority: userPubkey });
            return signature;
        } catch (err: any) {
            console.error("Detailed Error in createProfile:", err);
            if (err.logs) console.log("Simulation Logs:", err.logs);
            if (err.message?.includes("Transaction too large")) {
                console.log("Pro-tip: Input data is too long for a Passkey transaction. Try shortening your username or removing emojis.");
            }
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
            await checkAndAirdrop(userPubkey);

            const [profilePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user-profile-v1"), userPubkey.toBuffer()],
                new PublicKey(PROGRAM_ID_STR)
            );

            const instruction = await program.methods
                .updateUser(username, emoji, gender, pin)
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

            // Disable sponsorship to save 100+ bytes and fix "Transaction too large"
            // @ts-ignore
            const signature = await signAndSendTransaction(tx, { sponsor: false });
            console.log("Profile updated successfully! Signature:", signature);
            setProfile({ username, emoji, gender, pin, authority: userPubkey });
        } catch (err: any) {
            console.error("Detailed Error in updateProfile:", err);
            if (err.logs) console.log("Simulation Logs:", err.logs);
            if (err.message?.includes("Transaction too large")) {
                console.log("Pro-tip: Input data is too long for a Passkey transaction. Try shortening your username or removing emojis.");
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 3. PREVENT THE FETCH LOOP
    useEffect(() => {
        if (smartWalletPubkey) {
            console.log("SMART WALLET ADDRESS:", smartWalletPubkey.toString());
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
