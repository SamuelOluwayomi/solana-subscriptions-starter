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

    const [mockAddress, setMockAddress] = useState<string | null>(null);

    useEffect(() => {
        // Load mock address if it exists (persisting simulation across navigations)
        const stored = localStorage.getItem('mockWalletAddress');
        if (stored) setMockAddress(stored);
    }, []);

    const simulateCreateWallet = useCallback(async () => {
        setLocalLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate a valid base58-looking address (Solana addresses are 44 chars, base58)
        const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let fakeAddress = '';
        for (let i = 0; i < 44; i++) {
            fakeAddress += base58chars.charAt(Math.floor(Math.random() * base58chars.length));
        }

        localStorage.setItem('mockWalletAddress', fakeAddress);
        setMockAddress(fakeAddress);

        setLocalLoading(false);
        router.push('/dashboard');
    }, [router]);

    const clearMock = useCallback(() => {
        localStorage.removeItem('mockWalletAddress');
        setMockAddress(null);
    }, []);

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

    const handleCreate = useCallback(async (isSimulation: boolean = false) => {
        if (isSimulation) {
            await simulateCreateWallet();
            return;
        }

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
    }, [connect, router, simulateCreateWallet]);

    const [balance, setBalance] = useState<number | null>(null);

    const refreshBalance = useCallback(async () => {
        const currentAddress = address || mockAddress;
        if (!currentAddress) return;
        try {
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const lamports = await connection.getBalance(new PublicKey(currentAddress));
            setBalance(lamports / LAMPORTS_PER_SOL);
        } catch (e) {
            console.error("Failed to fetch balance", e);
        }
    }, [address, mockAddress]);

    // Fetch balance on mount/auth
    useEffect(() => {
        const currentAddress = address || mockAddress;
        if (currentAddress) {
            refreshBalance();
            // Set up polling interval for real-time updates
            const interval = setInterval(refreshBalance, 5000);
            return () => clearInterval(interval);
        }
    }, [address, mockAddress, refreshBalance]);

    const requestAirdrop = useCallback(async () => {
        const currentAddress = address || mockAddress;
        if (!currentAddress) return;
        try {
            setLocalLoading(true);
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const signature = await connection.requestAirdrop(new PublicKey(currentAddress), 1 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature);
            await refreshBalance();
        } catch (error) {
            console.error("Airdrop failed:", error);
            alert("Airdrop failed. You may be rate limited.");
        } finally {
            setLocalLoading(false);
        }
    }, [address, mockAddress, refreshBalance]);

    return {
        loading: localLoading || sdkLoading,
        loginWithPasskey: handleAuth,
        createPasskeyWallet: handleCreate,
        address: address || mockAddress,
        isAuthenticated: isAuthenticated || !!mockAddress,
        balance,
        requestAirdrop,
        logout: () => {
            disconnect();
            clearMock();
            router.push('/');
        }
    };
}
