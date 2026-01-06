"use client";

import { LazorkitProvider, DEFAULTS } from '@lazorkit/wallet'
import { ReactNode, useState, useEffect, useMemo } from 'react'
import { LoaderProvider } from '@/context/LoaderContext'
import { ToastProvider } from '@/context/ToastContext'

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Stable config object to prevent infinite re-renders in LazorkitProvider
    const paymasterConfig = useMemo(() => ({
        paymasterUrl: "https://kora.devnet.lazorkit.com"
    }), [])

    return (
        <ToastProvider>
            <LoaderProvider>
                {mounted ? (
                    <LazorkitProvider
                        rpcUrl="https://api.devnet.solana.com"
                        portalUrl="https://portal.lazor.sh"
                        paymasterConfig={paymasterConfig}
                    >
                        {children}
                    </LazorkitProvider>
                ) : (
                    <>{children}</>
                )}
            </LoaderProvider>
        </ToastProvider>
    )
}
