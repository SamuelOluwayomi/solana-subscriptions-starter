import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useLazorkit() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        setLoading(true);
        // Simulate the Lazorkit SDK delay (Biometric prompt + Blockchain confirm)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        router.push('/'); // Redirect to home or dashboard after login
    };

    return {
        loading,
        loginWithPasskey: handleAuth,
        createPasskeyWallet: handleAuth
    };
}
