import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { CADPAY_MINT } from '../utils/cadpayToken';

// Use our Custom CadPay Mint
// const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Manually derive associated token address (for compatibility with older SPL token versions)
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

export function useUSDCBalance(walletAddress: string | null) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);

    const fetchBalance = async () => {
        if (!walletAddress) {
            setBalance(0);
            return;
        }

        setLoading(true);
        try {
            const walletPubkey = new PublicKey(walletAddress);

            // Get the associated token account address
            const ata = await findAssociatedTokenAddress(walletPubkey, CADPAY_MINT);
            setTokenAccount(ata);

            try {
                // Fetch the raw account data
                const accountInfo = await connection.getAccountInfo(ata);

                if (accountInfo && accountInfo.data) {
                    // Parse token amount from account data
                    // Token amount is stored at bytes 64-72 as a little-endian u64
                    const buffer = Buffer.from(accountInfo.data);
                    // Use DataView for browser compatibility
                    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    const amount = view.getBigUint64(64, true); // true for little-endian
                    const usdcBalance = Number(amount) / 1_000_000; // USDC has 6 decimals
                    setBalance(usdcBalance);
                } else {
                    // Account doesn't exist yet (no USDC)
                    setBalance(0);
                }
            } catch (e) {
                // Account doesn't exist or error fetching
                // Token account not found or error
                setBalance(0);
            }
        } catch (error) {
            console.error('Error fetching USDC balance:', error);
            setBalance(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();

        // Refresh every 10 seconds
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [walletAddress]);

    return { balance, loading, tokenAccount, refetch: fetchBalance };
}
