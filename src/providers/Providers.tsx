"use client";

import { LazorkitProvider, DEFAULTS } from '@lazorkit/wallet'
import { ReactNode, useState, useEffect, useMemo } from 'react'
import { LoaderProvider } from '@/context/LoaderContext'
import { ToastProvider } from '@/context/ToastContext'
import { MerchantProvider } from '@/context/MerchantContext'

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
                <MerchantProvider> {/* Added MerchantProvider */}
                    {mounted ? (
                        <LazorkitProvider
                            rpcUrl={process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'}
                            portalUrl="https://portal.lazor.sh"
                            paymasterConfig={process.env.NEXT_PUBLIC_DISABLE_PAYMASTER === 'true' ? undefined : paymasterConfig}
                        >
                            {children}
                        </LazorkitProvider>
                    ) : (
                        <>{children}</>
                    )}
                </MerchantProvider>
            </LoaderProvider>
        </ToastProvider>
    )
}
