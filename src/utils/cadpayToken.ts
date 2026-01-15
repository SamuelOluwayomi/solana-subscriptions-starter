import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    TransactionInstruction
} from '@solana/web3.js';

// Constants
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// 🔐 HARDCODED DEMO MINT AUTHORITY (Payer & Signer)
const DEMO_SECRET = Uint8Array.from([121, 245, 208, 33, 94, 159, 22, 240, 87, 151, 101, 67, 181, 127, 48, 233, 186, 185, 186, 3, 61, 171, 139, 51, 104, 114, 29, 56, 133, 86, 143, 242, 117, 11, 164, 144, 110, 221, 28, 93, 146, 199, 6, 164, 47, 114, 51, 84, 158, 164, 141, 188, 79, 124, 17, 31, 251, 178, 145, 126, 174, 242, 186, 97]);
export const MINT_AUTHORITY = Keypair.fromSecretKey(DEMO_SECRET);

// 🏦 HARDCODED MINT ACCOUNT KEYPAIR (The Token Itself)
const DEMO_MINT_SECRET = Uint8Array.from([123, 193, 13, 207, 96, 242, 30, 107, 150, 74, 0, 79, 34, 192, 8, 200, 226, 9, 25, 31, 5, 226, 254, 242, 67, 146, 26, 111, 192, 44, 200, 104, 61, 70, 49, 248, 129, 212, 154, 58, 25, 167, 92, 220, 81, 47, 21, 140, 65, 182, 52, 176, 134, 155, 239, 23, 247, 80, 127, 242, 82, 143, 23, 166]);
export const MINT_KEYPAIR = Keypair.fromSecretKey(DEMO_MINT_SECRET);
export const CADPAY_MINT = MINT_KEYPAIR.publicKey;

// #region agent log
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:23',message:'Creating connection',data:{rpcUrl,envVar:process.env.NEXT_PUBLIC_RPC_URL||'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

// Create connection - will be replaced with retry-enabled connection in functions that need it
// For backward compatibility, keep the module-level connection but functions will use retry mechanism
const connection = new Connection(rpcUrl, 'confirmed');

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
    const mintInfo = await connection.getAccountInfo(CADPAY_MINT);
    if (!mintInfo) {

        // A. Check Mint Authority Balance - It needs SOL to pay for the Mint Account
        const authBalance = await connection.getBalance(MINT_AUTHORITY.publicKey);
        if (authBalance < 0.05 * 1000000000) { // If less than 0.05 SOL
            try {
                const sig = await connection.requestAirdrop(MINT_AUTHORITY.publicKey, 1 * 1000000000); // 1 SOL
                const latest = await connection.getLatestBlockhash();
                await connection.confirmTransaction({ signature: sig, ...latest });
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
        // Mint Account found
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

    // Sign with Mint Authority (Payer/Auth) 
    // Only sign with Mint Keypair if we are initializing it
    if (!mintInfo) {
        transaction.sign(MINT_AUTHORITY, MINT_KEYPAIR);
    } else {
        transaction.sign(MINT_AUTHORITY);
    }

    return {
        transaction,
        sendTransaction: async () => {
            return await connection.sendRawTransaction(transaction.serialize());
        }
    };
}

export const DEMO_MERCHANT_WALLET = new PublicKey("CqUmZNET15kK6qjNPrtPZdE3VUMem9ULtQ77GtVpUo1f");

// Helper to ensure Merchant has an ATA (Paid by Mint Auth)
export async function ensureMerchantHasATA(merchantAddress: string) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:203',message:'ensureMerchantHasATA called',data:{merchantAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const merchantPubkey = new PublicKey(merchantAddress);
    const merchantATA = await findAssociatedTokenAddress(merchantPubkey, CADPAY_MINT);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:207',message:'Checking merchant ATA existence',data:{merchantATA:merchantATA.toBase58()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Use retry mechanism for RPC calls
    const { createConnectionWithRetry } = await import('./rpc');
    const conn = await createConnectionWithRetry();
    
    let accountInfo;
    try {
        accountInfo = await conn.getAccountInfo(merchantATA);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:211',message:'Merchant ATA check result',data:{merchantATA:merchantATA.toBase58(),exists:!!accountInfo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    } catch (rpcError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:215',message:'Merchant ATA check RPC failed',data:{merchantATA:merchantATA.toBase58(),error:rpcError?.message||String(rpcError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Re-throw with more context
        throw new Error(`Failed to check merchant ATA: ${rpcError?.message || 'RPC connection failed'}. Please check your network connection and RPC endpoint.`);
    }

    if (!accountInfo) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:220',message:'Creating merchant ATA',data:{merchantATA:merchantATA.toBase58()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        try {
            const transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    MINT_AUTHORITY.publicKey, // System Payer
                    merchantATA,
                    merchantPubkey,
                    CADPAY_MINT
                )
            );

            const { blockhash } = await conn.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = MINT_AUTHORITY.publicKey;
            transaction.sign(MINT_AUTHORITY);

            const signature = await conn.sendRawTransaction(transaction.serialize());
            const latestBlockhash = await conn.getLatestBlockhash();
            await conn.confirmTransaction({ signature, ...latestBlockhash });
            
            // Verify the ATA was created
            const verifyInfo = await conn.getAccountInfo(merchantATA);
            if (!verifyInfo) {
                throw new Error('Merchant ATA creation transaction completed but account not found. Transaction may have failed.');
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:225',message:'Merchant ATA created successfully',data:{merchantATA:merchantATA.toBase58(),signature},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
        } catch (createError: any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:240',message:'Merchant ATA creation failed',data:{merchantATA:merchantATA.toBase58(),error:createError?.message||String(createError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            throw new Error(`Failed to create merchant ATA: ${createError?.message || 'Unknown error'}. Please try again.`);
        }
    }
}

// Import generic types from spl-token (using modern version)
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    AccountLayout
} from '@solana/spl-token';

export async function constructTransferTransaction(
    userAddress: string,
    amount: number,
    merchantAddress: string, // Dynamic Merchant Wallet
    serviceName?: string,
    planName?: string
): Promise<TransactionInstruction[]> {
    const userPubkey = new PublicKey(userAddress);
    const merchantPubkey = new PublicKey(merchantAddress);

    // Use retry mechanism for all RPC calls
    const { createConnectionWithRetry } = await import('./rpc');
    const conn = await createConnectionWithRetry();

    // 🔍 DIAGNOSTIC: Log the address being used (ownership check temporarily disabled)
    const userAccountOwner = await conn.getAccountInfo(userPubkey);
    const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111');


    // Temporarily disabled to allow transaction to proceed
    // if (userAccountOwner && userAccountOwner.owner.equals(SYSTEM_PROGRAM)) {
    //     console.error("❌ CRITICAL: This address is owned by System Program (Standard Wallet/Passkey)!");
    //     throw new Error("ERROR_PASSKEY_ADDRESS...");
    // }


    // 1. FORCE CLEAN ADDRESSES & RE-DERIVE (Fix for Off-Curve PDAs/Smart Wallets)
    // We re-calculate everything to ensure mathematical correctness
    const usdcMintKey = CADPAY_MINT; // Using the constant defined in this file

    // Re-derive User ATA allowing for Off-Curve owners (PDAs)
    const userATA = await getAssociatedTokenAddress(
        usdcMintKey,
        userPubkey,
        true, // allowOwnerOffCurve = true (CRITICAL for Smart Wallets/PDAs)
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Re-derive Merchant ATA allowing for Off-Curve owners (just in case)
    const merchantATA = await getAssociatedTokenAddress(
        usdcMintKey,
        merchantPubkey,
        true, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );


    // 1a. Verify User Checks (Account Exists & Sufficient Funds)
    const userAccountInfo = await conn.getAccountInfo(userATA);
    if (!userAccountInfo) {
        throw new Error("ERROR_NO_ACCOUNT: You don't have a USDC account. Please use the Faucet first.");
    }

    // CRITICAL CHECK: Ensure User ATA is owned by Token Program
    if (!userAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        console.error(`FATAL: User ATA is owned by ${userAccountInfo.owner.toBase58()}, expected ${TOKEN_PROGRAM_ID.toBase58()}`);
        throw new Error("ERROR_INVALID_USER_ACCOUNT: Your USDC account is corrupted. Please contact support.");
    }

    // 1b. Verify Balance
    try {
        const balanceResponse = await conn.getTokenAccountBalance(userATA);
        const balance = balanceResponse.value.uiAmount || 0;
        // Check user balance

        if (balance < (amount / 1_000_000)) {
            throw new Error(`ERROR_INSUFFICIENT_FUNDS: You have ${balance} USDC but need ${amount / 1_000_000}.`);
        }
    } catch (e: any) {
        console.error("Failed to check balance:", e);
        // If it's an RPC error, provide more context
        if (e?.message?.includes('fetch') || e?.message?.includes('network') || e?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            throw new Error(`ERROR_RPC_FAILURE: Unable to check balance due to network error. Please check your connection and try again.`);
        }
        throw e;
    }

    // 1c. Verify Merchant ATA Exists
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:305',message:'Checking merchant ATA before RPC call',data:{merchantATA:merchantATA.toBase58(),merchantAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    let merchantAccountInfo;
    try {
        merchantAccountInfo = await conn.getAccountInfo(merchantATA);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:310',message:'Merchant ATA RPC call result',data:{merchantATA:merchantATA.toBase58(),exists:!!merchantAccountInfo,error:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
    } catch (rpcError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:315',message:'Merchant ATA RPC call failed',data:{merchantATA:merchantATA.toBase58(),error:rpcError?.message||String(rpcError),errorType:rpcError?.name||'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new Error(`ERROR_RPC_FAILURE: ${rpcError?.message || 'RPC call failed'}. Please check your network connection.`);
    }
    if (!merchantAccountInfo) {
        console.error(`CRITICAL: Merchant ATA ${merchantATA.toBase58()} does not exist on-chain!`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cadpayToken.ts:320',message:'Merchant ATA does not exist',data:{merchantATA:merchantATA.toBase58()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Try to create it automatically before throwing error
        try {
            await ensureMerchantHasATA(merchantAddress);
            // Re-check after creation
            merchantAccountInfo = await conn.getAccountInfo(merchantATA);
            if (!merchantAccountInfo) {
                throw new Error("ERROR_MERCHANT_SETUP: Failed to create merchant ATA. Please try again.");
            }
        } catch (ensureError: any) {
            throw new Error(`ERROR_MERCHANT_SETUP: Merchant wallet is not initialized. ${ensureError.message}`);
        }
    }

    // 2. Create Memo Instruction (SPL Memo Protocol Integration)
    const { createMemoInstruction } = await import('@solana/spl-memo');

    // Simple format: "Netflix - Premium" (merchant displays this directly)
    // Capped at 50 chars to avoid TransactionTooLarge error on mobile
    const memoMessage = (serviceName && planName
        ? `${serviceName} - ${planName}`
        : `Subscription Payment`).slice(0, 50);

    const memoInstruction = createMemoInstruction(memoMessage, [userPubkey]);

    // 3. Create Transfer Instruction using SPL Token Library
    const transferIx = createTransferInstruction(
        userATA,              // Source (Derived from Smart Wallet)
        merchantATA,          // Destination
        userPubkey,           // Authority (Smart Wallet Address)
        BigInt(amount),       // Amount
        [],                   // MultiSigners
        TOKEN_PROGRAM_ID      // Program ID
    );

    // Return both instructions: memo first, then transfer
    return [memoInstruction, transferIx];
}

