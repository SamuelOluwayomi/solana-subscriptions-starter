import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    TransactionInstruction
} from '@solana/web3.js';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

// Constants
// export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// 🔐 HARDCODED DEMO MINT AUTHORITY (Payer & Signer)
const DEMO_SECRET = Uint8Array.from([121, 245, 208, 33, 94, 159, 22, 240, 87, 151, 101, 67, 181, 127, 48, 233, 186, 185, 186, 3, 61, 171, 139, 51, 104, 114, 29, 56, 133, 86, 143, 242, 117, 11, 164, 144, 110, 221, 28, 93, 146, 199, 6, 164, 47, 114, 51, 84, 158, 164, 141, 188, 79, 124, 17, 31, 251, 178, 145, 126, 174, 242, 186, 97]);
export const MINT_AUTHORITY = Keypair.fromSecretKey(DEMO_SECRET);

// 🏦 HARDCODED MINT ACCOUNT KEYPAIR (The Token Itself)
const DEMO_MINT_SECRET = Uint8Array.from([123, 193, 13, 207, 96, 242, 30, 107, 150, 74, 0, 79, 34, 192, 8, 200, 226, 9, 25, 31, 5, 226, 254, 242, 67, 146, 26, 111, 192, 44, 200, 104, 61, 70, 49, 248, 129, 212, 154, 58, 25, 167, 92, 220, 81, 47, 21, 140, 65, 182, 52, 176, 134, 155, 239, 23, 247, 80, 127, 242, 82, 143, 23, 166]);
export const MINT_KEYPAIR = Keypair.fromSecretKey(DEMO_MINT_SECRET);
export const CADPAY_MINT = MINT_KEYPAIR.publicKey;

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// --- Manual Instruction Helpers (No SPL Token Lib Dep) ---

function createMintToInstruction(
    mint: PublicKey,
    destination: PublicKey,
    authority: PublicKey,
    amount: number
): TransactionInstruction {
    // MintTo Instruction Layout: [7, amount(u64)]
    const keys = [
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false }, // Mint Authority signs
    ];

    const data = Buffer.alloc(9);
    data.writeUInt8(7, 0); // Instruction 7: MintTo

    // Manual writeBigUInt64LE for browser compatibility
    // data.writeBigUInt64LE(BigInt(amount), 1); 
    const bigAmount = BigInt(amount);
    for (let i = 0; i < 8; i++) {
        data[1 + i] = Number((bigAmount >> BigInt(8 * i)) & BigInt(0xff));
    }

    return new TransactionInstruction({
        keys,
        programId: TOKEN_PROGRAM_ID,
        data,
    });
}

async function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): Promise<PublicKey> {
    return (await PublicKey.findProgramAddress(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
}

function createAssociatedTokenAccountInstruction(
    payer: PublicKey,
    associatedToken: PublicKey,
    owner: PublicKey,
    mint: PublicKey
): TransactionInstruction {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedToken, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.alloc(0),
    });
}

export async function constructMintTransaction(
    userAddress: string,
    amount: number = 50 * 1_000_000 // 50 USDC default
) {
    const userPubkey = new PublicKey(userAddress);
    const transaction = new Transaction();

    // 0. Check if Mint exists and Initialize if needed
    // 0. Check if Mint exists and Initialize if needed
    const mintInfo = await connection.getAccountInfo(CADPAY_MINT);
    if (!mintInfo) {
        console.log(" Mint Account not found. Initializing...");

        // A. Check Mint Authority Balance - It needs SOL to pay for the Mint Account
        const authBalance = await connection.getBalance(MINT_AUTHORITY.publicKey);
        if (authBalance < 0.05 * 1000000000) { // If less than 0.05 SOL
            console.log("Mint Authority needs SOL. Requesting Airdrop...");
            try {
                const sig = await connection.requestAirdrop(MINT_AUTHORITY.publicKey, 1 * 1000000000); // 1 SOL
                const latest = await connection.getLatestBlockhash();
                await connection.confirmTransaction({ signature: sig, ...latest });
                console.log("Mint Authority funded.");
            } catch (e) {
                console.error("Failed to fund Mint Authority:", e);
                // Proceed anyway, maybe it has just enough
            }
        }

        // Calculate rent for Mint account
        const lamports = await connection.getMinimumBalanceForRentExemption(82); // MINT_SIZE = 82

        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: MINT_AUTHORITY.publicKey, // PAYER: Mint Authority (We just funded it)
                newAccountPubkey: CADPAY_MINT,
                space: 82, // MINT_SIZE
                lamports,
                programId: TOKEN_PROGRAM_ID,
            })
        );

        // Manual InitializeMint Instruction (Opcode 0)
        const initData = Buffer.alloc(67);
        initData.writeUInt8(0, 0); // Instruction 0: InitializeMint
        initData.writeUInt8(6, 1); // Decimals (6 for USDC)
        initData.set(MINT_AUTHORITY.publicKey.toBuffer(), 2); // Mint Authority
        initData.writeUInt8(0, 34); // No Freeze Authority

        transaction.add(new TransactionInstruction({
            keys: [
                { pubkey: CADPAY_MINT, isSigner: false, isWritable: true },
                { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false }
            ],
            programId: TOKEN_PROGRAM_ID,
            data: initData
        }));
    } else {
        console.log("Mint Account found. Proceeding to mint...");
    }

    // 1. Get User's ATA
    const userATA = await findAssociatedTokenAddress(userPubkey, CADPAY_MINT);

    // 2. Check if ATA exists (via RPC)
    const accountInfo = await connection.getAccountInfo(userATA);

    if (!accountInfo) {
        // Create ATA
        // Payer = MINT_AUTHORITY (Signer)
        // Owner = User (NOT Signer)
        transaction.add(
            createAssociatedTokenAccountInstruction(
                MINT_AUTHORITY.publicKey, // Payer
                userATA,
                userPubkey, // Owner
                CADPAY_MINT
            )
        );
    }

    // 3. Mint Logic
    transaction.add(
        createMintToInstruction(
            CADPAY_MINT,
            userATA,
            MINT_AUTHORITY.publicKey,
            amount
        )
    );

    // FETCH BLOCKHASH & SET FEE PAYER
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = MINT_AUTHORITY.publicKey; // Mint Authority Pays!

    // Sign with Mint Authority (Payer/Auth) AND Mint Keypair (If initializing)
    // Safe to sign with both always
    transaction.sign(MINT_AUTHORITY, MINT_KEYPAIR);

    return {
        transaction,
        sendTransaction: async () => {
            return await connection.sendRawTransaction(transaction.serialize());
        }
    };
}

export const DEMO_MERCHANT_WALLET = new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");

// Helper to ensure Merchant has an ATA (Paid by Mint Auth)
export async function ensureMerchantHasATA(merchantAddress: string) {
    const merchantPubkey = new PublicKey(merchantAddress);
    const merchantATA = await findAssociatedTokenAddress(merchantPubkey, CADPAY_MINT);
    const accountInfo = await connection.getAccountInfo(merchantATA);

    if (!accountInfo) {
        console.log("Merchant ATA missing. Initializing via System...");
        const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                MINT_AUTHORITY.publicKey, // System Payer
                merchantATA,
                merchantPubkey,
                CADPAY_MINT
            )
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = MINT_AUTHORITY.publicKey;
        transaction.sign(MINT_AUTHORITY);

        const signature = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction({ signature, ...await connection.getLatestBlockhash() });
        console.log("Merchant ATA Initialized:", signature);
    }
}

export async function constructTransferTransaction(
    smartWalletAddress: string,
    amount: number,
    merchantAddress: string // Dynamic Merchant Wallet
): Promise<TransactionInstruction> {
    // ⚠️ IMPORTANT:
    // smartWalletAddress MUST be the Smart Wallet / PDA that actually OWNS the USDC ATA,
    // NOT the passkey / credential public key.
    const smartWalletPubkey = new PublicKey(smartWalletAddress);
    const merchantPubkey = new PublicKey(merchantAddress);

    // 1. Get ATAs for User (Smart Wallet) and Merchant
    const userATA = await findAssociatedTokenAddress(smartWalletPubkey, CADPAY_MINT);
    const merchantATA = await findAssociatedTokenAddress(merchantPubkey, CADPAY_MINT);

    // 1a. Verify User Checks (Account Exists & Sufficient Funds)
    const userAccountInfo = await connection.getAccountInfo(userATA);
    if (!userAccountInfo) {
        throw new Error("ERROR_NO_ACCOUNT: You don't have a USDC account. Please use the Faucet first.");
    }

    // CRITICAL CHECK: Ensure User ATA is owned by Token Program
    console.log(`User ATA Code Owner: ${userAccountInfo.owner.toBase58()}`);
    if (!userAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        console.error(`FATAL: User ATA is owned by ${userAccountInfo.owner.toBase58()}, expected ${TOKEN_PROGRAM_ID.toBase58()}`);
        throw new Error("ERROR_INVALID_USER_ACCOUNT: Your USDC account is corrupted. Please contact support.");
    }

    // DEEP CHECK: Verify the Token Account's "Owner" field matches userPubkey
    try {
        const decodedData = AccountLayout.decode(userAccountInfo.data);
        const actualOwner = new PublicKey(decodedData.owner);
        console.log(`🔍 ATA Data Owner: ${actualOwner.toBase58()}`);
        console.log(`🔍 Expected Smart Wallet Owner: ${smartWalletPubkey.toBase58()}`);

        if (!actualOwner.equals(smartWalletPubkey)) {
            console.error(`❌ OWNER MISMATCH! ATA belongs to ${actualOwner.toBase58()}, but Smart Wallet is ${smartWalletPubkey.toBase58()}`);
            // This mismatch will cause custom program error 0x2 (InvalidDelegate / Owner mismatch)
        } else {
            console.log("✅ Owner match confirmed.");
        }
    } catch (err) {
        console.error("Failed to decode ATA data:", err);
    }

    try {
        const balanceResponse = await connection.getTokenAccountBalance(userATA);
        const balance = balanceResponse.value.uiAmount || 0;
        console.log(`User Balance: ${balance} USDC, Required: ${amount / 1_000_000} USDC`);

        if (balance < (amount / 1_000_000)) {
            throw new Error(`ERROR_INSUFFICIENT_FUNDS: You have ${balance} USDC but need ${amount / 1_000_000}.`);
        }
    } catch (e) {
        console.error("Failed to check balance:", e);
    }
    // 1b. Verify Merchant ATA Exists (Should have been created by ensureMerchantHasATA)
    const merchantAccountInfo = await connection.getAccountInfo(merchantATA);
    if (!merchantAccountInfo) {
        console.error(`CRITICAL: Merchant ATA ${merchantATA.toBase58()} does not exist on-chain!`);
        throw new Error("ERROR_MERCHANT_SETUP: Merchant wallet is not initialized. Please try again.");
    } else {
        console.log(`Merchant ATA confirmed: ${merchantATA.toBase58()}`);
        console.log(`Merchant ATA Owner: ${merchantAccountInfo.owner.toBase58()}`);

        // CRITICAL CHECK: Ensure it is owned by Token Program
        if (!merchantAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
            console.error(`FATAL: Merchant ATA is owned by ${merchantAccountInfo.owner.toBase58()}, expected ${TOKEN_PROGRAM_ID.toBase58()}`);
            throw new Error("ERROR_INVALID_MERCHANT: Merchant wallet is corrupted (Wrong Owner).");
        }
    }

    // 2. Create Transfer Instruction (SPL Token Transfer)
    // Authority MUST be the Smart Wallet PDA that owns `userATA`, NOT the passkey.
    const data = Buffer.alloc(9);
    data.writeUInt8(3, 0); // Transfer instruction

    // Manually encode amount as little-endian u64 (browser-compatible)
    const bigAmount = BigInt(amount);
    for (let i = 0; i < 8; i++) {
        data[1 + i] = Number((bigAmount >> BigInt(8 * i)) & BigInt(0xff));
    }

    const transferIx = new TransactionInstruction({
        keys: [
            { pubkey: userATA, isSigner: false, isWritable: true },          // Source ATA (Smart Wallet's USDC)
            { pubkey: merchantATA, isSigner: false, isWritable: true },      // Destination ATA (Merchant)
            { pubkey: smartWalletPubkey, isSigner: true, isWritable: false } // Authority MUST be signer (Lazorkit provides signature)
        ],
        programId: TOKEN_PROGRAM_ID,
        data
    });

    return transferIx; // Return just the instruction
}
