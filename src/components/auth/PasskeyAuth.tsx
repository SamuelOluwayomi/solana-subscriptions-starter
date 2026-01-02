'use client';

import { useWallet } from '@lazorkit/wallet'
import { useState, useEffect } from 'react'

export default function PasskeyAuth() {
    const { isConnected, connect, disconnect, smartWalletPubkey } = useWallet()
    const [mounted, setMounted] = useState(false)

    const address = smartWalletPubkey?.toBase58()

    const handleConnect = async () => {
        try {
            await connect()
        } catch (error) {
            console.error("Passkey connection error:", error)
            alert("Failed to connect. Please make sure you didn't cancel the prompt and that your device supports Passkeys (TouchID/FaceID/Windows Hello).")
        }
    }

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="flex items-center gap-4">
            {isConnected ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {address?.slice(0, 4)}...{address?.slice(-4)}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="flex h-12 items-center justify-center rounded-full border border-solid border-red-200 bg-red-50 px-5 text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                    Log in with Passkey
                </button>
            )}
        </div>
    )
}
