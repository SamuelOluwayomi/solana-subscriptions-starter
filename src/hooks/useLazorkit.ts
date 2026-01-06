import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
// @ts-ignore - Assuming export exists, will fix if error
import { useWallet } from '@lazorkit/wallet';
import { useToast } from '@/context/ToastContext';

export function useLazorkit() {
    const router = useRouter();
    const { showToast } = useToast();
    // @ts-ignore
    const { connect, disconnect, wallet, isConnected, isLoading: sdkLoading } = useWallet();
    const [localLoading, setLocalLoading] = useState(false);

    // Derived address from wallet object or hook state
    // @ts-ignore
    const address = wallet?.smartWallet || null;
    // @ts-ignore
    const isAuthenticated = isConnected;

    // Clear any auto-login session on mount to force biometric re-auth
    useEffect(() => {
        const clearAutoLogin = async () => {
            // Only auto-disconnect if we're on signin page and already connected
            if (window.location.pathname === '/signin' && isConnected) {
                console.log('Clearing cached session - requiring fresh biometric auth');
                await disconnect();
            }
        };
        clearAutoLogin();
    }, []);

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
                console.log('Disconnecting existing wallet before creating new one...');
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

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        try {
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const lamports = await connection.getBalance(new PublicKey(address));
            setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (e) {
            console.error("Failed to fetch balance", e);
        }
    }, [address]);

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
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
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

    return {
        loading: localLoading || sdkLoading,
        loginWithPasskey: handleAuth,
        createPasskeyWallet: handleCreate,
        address,
        isAuthenticated,
        balance,
        requestAirdrop,
        logout: () => {
            disconnect();
            router.push('/');
        }
    };
}
