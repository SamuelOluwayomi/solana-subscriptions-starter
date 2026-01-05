import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
// @ts-ignore - Assuming export exists, will fix if error
import { useWallet } from '@lazorkit/wallet';

export function useLazorkit() {
    const router = useRouter();
    // @ts-ignore
    const { connect, disconnect, wallet, isConnected, isLoading: sdkLoading } = useWallet();
    const [localLoading, setLocalLoading] = useState(false);

    // Derived address from wallet object or hook state
    // @ts-ignore
    const address = wallet?.smartWallet || null;
    // @ts-ignore
    const isAuthenticated = isConnected;

    const handleAuth = useCallback(async () => {
        try {
            setLocalLoading(true);
            await connect();
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Authentication failed:", error);
            if (error.name === 'NotAllowedError' || error.message?.includes('timed out') || error.message?.includes('not allowed')) {
                alert("Authentication canceled or not allowed. \n\n1. Ensure you are on 'localhost' or HTTPS.\n2. Ensure your device has biometrics or PIN (Windows Hello) set up.\n3. Make sure you didn't cancel the prompt.");
            } else {
                alert(`Authentication failed: ${error.message || error}`);
            }
        } finally {
            setLocalLoading(false);
        }
    }, [connect, router]);

    const handleLogin = handleAuth;
    const handleCreate = handleAuth;

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
            await connection.confirmTransaction(signature);
            await refreshBalance();
        } catch (error) {
            console.error("Airdrop failed:", error);
            alert("Airdrop failed. You may be rate limited.");
        } finally {
            setLocalLoading(false);
        }
    }, [address, refreshBalance]);

    return {
        loading: localLoading || sdkLoading,
        loginWithPasskey: handleLogin,
        createPasskeyWallet: handleCreate,
        address,
        isAuthenticated,
        balance,
        requestAirdrop
    };
}
