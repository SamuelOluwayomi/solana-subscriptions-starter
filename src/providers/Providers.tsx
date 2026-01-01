"use client";

import { LazorkitProvider, DEFAULTS } from '@lazorkit/wallet'
import { ReactNode, useState, useEffect, useMemo } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Stable config object to prevent infinite re-renders in LazorkitProvider
    const paymasterConfig = useMemo(() => ({
        paymasterUrl: "https://lazorkit-paymaster.onrender.com"
    }), [])

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <LazorkitProvider
            paymasterConfig={paymasterConfig}
            rpcUrl="https://api.devnet.solana.com"
        >
            {children}
        </LazorkitProvider>
    )
}
