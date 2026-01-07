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

// 🔐 HARDCODED DEMO MINT AUTHORITY (For Hackathon Only!)
// This allows the frontend to sign mint transactions directly.
// DO NOT use this in production.
const DEMO_SECRET = Uint8Array.from([121, 245, 208, 33, 94, 159, 22, 240, 87, 151, 101, 67, 181, 127, 48, 233, 186, 185, 186, 3, 61, 171, 139, 51, 104, 114, 29, 56, 133, 86, 143, 242, 117, 11, 164, 144, 110, 221, 28, 93, 146, 199, 6, 164, 47, 114, 51, 84, 158, 164, 141, 188, 79, 124, 17, 31, 251, 178, 145, 126, 174, 242, 186, 97]);
export const MINT_AUTHORITY = Keypair.fromSecretKey(DEMO_SECRET);

// The Mint Address corresponding to the secret key above
// Since we are reusing the authority as the mint account for simplicity in this demo logic 
// (or usually separate, but let's assume valid pre-initialized mint for now)
// Actually, let's use a specific PRE-EXISTING Devnet Mint or create a new one.
// For reliability, we will pretend the 'MINT_AUTHORITY' is just the authority and we target a known mint.
// But to make it work 'from scratch', we might need to initialize the mint on first run?
// To avoid complexity: We will use the 'Fake USDC' mint if we can mint to it? No we can't.
// We must use OUR mint.

// Let's use the public key of the authority as the Mint Address for simplicity 
// (requires InitializeMint on this account).
export const CADPAY_MINT = MINT_AUTHORITY.publicKey;

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
    const mintInfo = await connection.getAccountInfo(CADPAY_MINT);
    if (!mintInfo) {
        console.log(" Mint Account not found. Initializing...");

        // Calculate rent for Mint account
        const lamports = await connection.getMinimumBalanceForRentExemption(82); // MINT_SIZE = 82

        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: userPubkey, // Payer
                newAccountPubkey: CADPAY_MINT,
                space: 82, // MINT_SIZE
                lamports,
                programId: TOKEN_PROGRAM_ID,
            })
        );

        // Manual InitializeMint Instruction (Opcode 0)
        // Data: [0, decimals, mintAuthority(32), freezeAuthorityOption(1), freezeAuthority(32/0)]
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
        // console.log("Creating ATA for user...");
        transaction.add(
            createAssociatedTokenAccountInstruction(
                userPubkey, // Payer (User paymaster/wallet)
                userATA,
                userPubkey, // Owner
                CADPAY_MINT
            )
        );
    }

    // 3. Mint Logic
    // NOTE: This mint (CADPAY_MINT) must be initialized on-chain. 
    // If it doesn't exist, this will fail.
    // For this hackathon demo to work INSTANTLY without manual setup,
    // we should use a generic "Transfer" from a big whale account we control?
    // OR: We try to initialize the mint if it doesn't exist? (Too complex for one tx).

    // FALLBACK STRATEGY FOR ROBUSTNESS: 
    // Just a 0 SOL transfer with memo to "Simulate" on chain if Mint fails?
    // User wants "VIEWABLE ON EXPLORER".

    // Let's assume we Mint. 
    transaction.add(
        createMintToInstruction(
            CADPAY_MINT,
            userATA,
            MINT_AUTHORITY.publicKey,
            amount
        )
    );

    // Add Memo for Explorer visibility
    transaction.add(
        new TransactionInstruction({
            keys: [{ pubkey: userPubkey, isSigner: true, isWritable: true }],
            data: Buffer.from(`CadPay USDC Audit: Funded $${amount / 1_000_000}`, 'utf-8'),
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb")
        })
    );

    // FETCH BLOCKHASH & SET FEE PAYER
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey; // User pays fee (or Paymaster via backend)

    return { transaction, mintKeypair: MINT_AUTHORITY };
}
