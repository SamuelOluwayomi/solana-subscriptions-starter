import { useEffect, useState, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { CADPAY_MINT, TOKEN_PROGRAM_ID } from '../utils/cadpayToken';

// Use retry mechanism for connection creation
import { createConnectionWithRetry } from '../utils/rpc';

// Create connection lazily to handle RPC failures
let connectionInstance: Connection | null = null;

async function getConnection(): Promise<Connection> {
    if (!connectionInstance) {
        // #region agent log
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:10',message:'Creating connection for balance',data:{rpcUrl,envVar:process.env.NEXT_PUBLIC_RPC_URL||'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        connectionInstance = await createConnectionWithRetry();
    }
    return connectionInstance;
}

export function useUSDCBalance(walletAddress: string | null) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tokenAccount, setTokenAccount] = useState<PublicKey | null>(null);
    const subscriptionIdRef = useRef<number | null>(null);
    const isSubscribedRef = useRef(false);

    const fetchBalance = async () => {
        if (!walletAddress) {
            setBalance(0);
            setTokenAccount(null);
            return;
        }

        setLoading(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:32',message:'fetchBalance called',data:{walletAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
            const walletPubkey = new PublicKey(walletAddress);
            const conn = await getConnection();

            // Get the associated token account address using SPL Token library
            const ata = await getAssociatedTokenAddress(
                CADPAY_MINT,
                walletPubkey,
                true, // allowOwnerOffCurve for smart wallets
                TOKEN_PROGRAM_ID
            );
            setTokenAccount(ata);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:43',message:'ATA derived, fetching balance',data:{ata:ata.toBase58()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion

            try {
                // Use getTokenAccountBalance for more reliable balance fetching
                const balanceResponse = await conn.getTokenAccountBalance(ata);
                const usdcBalance = balanceResponse.value.uiAmount || 0;
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:57',message:'Balance fetched',data:{usdcBalance,rawAmount:balanceResponse.value.amount,decimals:balanceResponse.value.decimals,uiAmountString:balanceResponse.value.uiAmountString,ata:ata.toBase58()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                console.log(`💰 USDC Balance for ${walletAddress}:`, {
                    uiAmount: usdcBalance,
                    rawAmount: balanceResponse.value.amount,
                    decimals: balanceResponse.value.decimals,
                    uiAmountString: balanceResponse.value.uiAmountString,
                    ata: ata.toBase58()
                });
                setBalance(usdcBalance);
            } catch (e: any) {
                // Account doesn't exist or error fetching
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:66',message:'Balance fetch failed',data:{error:e?.message||String(e),errorType:e?.name||'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                setBalance(0);
            }
        } catch (error: any) {
            console.error('Error fetching USDC balance:', error);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:71',message:'fetchBalance outer catch',data:{error:error?.message||String(error),errorType:error?.name||'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            setBalance(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!walletAddress) {
            setBalance(0);
            setTokenAccount(null);
            return;
        }

        // Initial fetch
        fetchBalance();

        // Set up real-time account change notifications
        let subscriptionId: number | null = null;
        const setupAccountSubscription = async () => {
            try {
                const walletPubkey = new PublicKey(walletAddress);
                const conn = await getConnection();
                const ata = await getAssociatedTokenAddress(
                    CADPAY_MINT,
                    walletPubkey,
                    true,
                    TOKEN_PROGRAM_ID
                );

                // Subscribe to account changes for real-time balance updates
                subscriptionId = conn.onAccountChange(
                    ata,
                    (accountInfo) => {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/a77a3c9b-d5a3-44e5-bf0a-030a0ae824ab',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUSDCBalance.ts:95',message:'Account change detected',data:{hasData:!!accountInfo.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                        // #endregion
                        // Immediately fetch updated balance when account changes
                        fetchBalance();
                    },
                    'confirmed'
                );
                subscriptionIdRef.current = subscriptionId;
                isSubscribedRef.current = true;
            } catch (error) {
                console.error('Failed to set up account subscription:', error);
                // Fallback to polling if subscription fails
            }
        };

        setupAccountSubscription();

        // Fallback polling every 3 seconds (faster than before) in case subscription fails
        const interval = setInterval(fetchBalance, 3000);

        return () => {
            // Cleanup: remove subscription and interval
            if (subscriptionIdRef.current !== null) {
                (async () => {
                    try {
                        const conn = await getConnection();
                        conn.removeAccountChangeListener(subscriptionIdRef.current!);
                    } catch (e) {
                        console.error('Error removing account subscription:', e);
                    }
                    subscriptionIdRef.current = null;
                    isSubscribedRef.current = false;
                })();
            }
            clearInterval(interval);
        };
    }, [walletAddress]);

    return { balance, loading, tokenAccount, refetch: fetchBalance };
}
