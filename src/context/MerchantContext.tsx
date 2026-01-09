'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

import { SERVICES } from '@/data/subscriptions';

export interface Merchant {
    id: string;
    name: string;
    email: string;
    password?: string; // Added password field
    walletPublicKey: string;
    walletSecretKey: string;
    joinedAt: Date;
}

export interface MerchantService {
    id: string;
    merchantId: string;
    name: string;
    description: string;
    price: number;
    icon: string; // url or icon name
    color: string;
}

interface MerchantContextType {
    merchant: Merchant | null;
    merchants: Merchant[];
    services: MerchantService[];
    createMerchant: (name: string, email: string, password?: string) => Promise<Merchant>;
    loginMerchant: (email: string, password?: string) => Promise<boolean>;
    logoutMerchant: () => void;
    createNewService: (name: string, price: number, description: string, color: string) => void;

    getMerchantServices: (merchantId: string) => MerchantService[];
    isLoading: boolean;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [services, setServices] = useState<MerchantService[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Seed Default Merchant
    useEffect(() => {
        const seed = async () => {
            const storedMerchants = localStorage.getItem('cadpay_merchants');
            let currentMerchants = storedMerchants ? JSON.parse(storedMerchants) : [];

            // FIXED KEYPAIR for Admin 01 to match DEMO_MERCHANT_WALLET
            const ADMIN_PUBKEY = "CqUmZNET15kK6qjNPrtPZdE3VUMem9ULtQ77GtVpUo1f";
            const ADMIN_SECRET = "370e1d9f4aa42bf53d7adf0f25034153406d8edaeec852c5e369f5ebb5b36cf3afdbd52a4e7e31ed6d1b0fc138d225a0bcece0a289e39539c7ecb73277566486"; // bs58 encoded

            // Check if default merchant exists
            const defaultEmail = 'Admin@gmail.com';
            const existingAdminIndex = currentMerchants.findIndex((m: Merchant) => m.email === defaultEmail);

            // Should we force update the admin? Yes, to ensure wallet sync
            const forceUpdate = existingAdminIndex !== -1 && currentMerchants[existingAdminIndex].walletPublicKey !== ADMIN_PUBKEY;

            if (existingAdminIndex === -1 || forceUpdate) {
                console.log(forceUpdate ? "Updating Admin 01 Wallet..." : "Seeding Default Merchant...");

                const defaultMerchant: Merchant = {
                    id: existingAdminIndex !== -1 ? currentMerchants[existingAdminIndex].id : crypto.randomUUID(),
                    name: 'Admin 01',
                    email: defaultEmail,
                    password: 'admin',
                    walletPublicKey: ADMIN_PUBKEY, // Syncs with DEMO_MERCHANT_WALLET
                    walletSecretKey: ADMIN_SECRET,
                    joinedAt: new Date()
                };

                if (forceUpdate) {
                    currentMerchants[existingAdminIndex] = defaultMerchant;
                } else {
                    currentMerchants = [...currentMerchants, defaultMerchant];
                }

                localStorage.setItem('cadpay_merchants', JSON.stringify(currentMerchants));
                setMerchants(currentMerchants);

                // Seed Services for this Merchant
                const seedServices = SERVICES.map(s => ({
                    id: crypto.randomUUID(),
                    merchantId: defaultMerchant.id,
                    name: s.name,
                    description: s.description,
                    price: s.plans[0].price, // Use base plan price
                    icon: s.id, // Use ID as icon reference
                    color: s.color
                }));

                const storedServices = localStorage.getItem('cadpay_services');
                const currentServices = storedServices ? JSON.parse(storedServices) : [];
                const updatedServices = [...currentServices, ...seedServices];

                localStorage.setItem('cadpay_services', JSON.stringify(updatedServices));
                setServices(updatedServices);
                console.log("Default Merchant & Services Seeded!");
            }
        };
        seed();
    }, []);

    // Load from local storage on mount (standard load)
    useEffect(() => {
        const storedMerchants = localStorage.getItem('cadpay_merchants');
        const storedServices = localStorage.getItem('cadpay_services');
        try {
            const storedMerchants = localStorage.getItem('cadpay_merchants');
            const storedServices = localStorage.getItem('cadpay_services');
            const activeMerchantId = localStorage.getItem('cadpay_active_merchant');

            if (storedMerchants) setMerchants(JSON.parse(storedMerchants));
            if (storedServices) setServices(JSON.parse(storedServices));

            if (activeMerchantId && storedMerchants) {
                const allMerchants = JSON.parse(storedMerchants);
                if (activeMerchantId) {
                    const found = allMerchants.find((m: Merchant) => m.id === activeMerchantId);
                    if (found) setMerchant(found);
                }
            }
        } catch (error) {
            console.error("Failed to load merchant:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveMerchants = (newMerchants: Merchant[]) => {
        setMerchants(newMerchants);
        localStorage.setItem('cadpay_merchants', JSON.stringify(newMerchants));
    };

    const saveServices = (newServices: MerchantService[]) => {
        setServices(newServices);
        localStorage.setItem('cadpay_services', JSON.stringify(newServices));
    };

    const createMerchant = async (name: string, email: string, password?: string) => {
        console.log("Generating new wallet for merchant...");
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toString();
        const secretKey = bs58.encode(keypair.secretKey);

        const newMerchant: Merchant = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            walletPublicKey: publicKey,
            walletSecretKey: secretKey,
            joinedAt: new Date()
        };

        const updatedMerchants = [...merchants, newMerchant];
        saveMerchants(updatedMerchants);
        setMerchant(newMerchant);
        localStorage.setItem('cadpay_active_merchant', newMerchant.id);

        return newMerchant;
    };

    const loginMerchant = async (email: string, password?: string) => {
        const found = merchants.find(m => m.email.toLowerCase() === email.toLowerCase());

        if (!found) {
            return false; // Merchant not found
        }

        // STRICT password check - password is required if merchant has one set
        if (found.password) {
            if (!password || found.password !== password) {
                console.log('Password mismatch or not provided');
                return false;
            }
        }

        setMerchant(found);
        localStorage.setItem('cadpay_active_merchant', found.id);
        return true;
    };

    const logoutMerchant = () => {
        setMerchant(null);
        localStorage.removeItem('cadpay_active_merchant');
    };

    const createNewService = (name: string, price: number, description: string, color: string) => {
        if (!merchant) return;

        const newService: MerchantService = {
            id: crypto.randomUUID(),
            merchantId: merchant.id,
            name,
            price,
            description,
            icon: 'Storefront', // Default icon
            color
        };

        const updatedServices = [...services, newService];
        saveServices(updatedServices);
    };

    const getMerchantServices = (merchantId: string) => {
        return services.filter(s => s.merchantId === merchantId);
    };

    return (
        <MerchantContext.Provider value={{
            merchant,
            merchants, // Pass it here
            services,
            createMerchant,
            loginMerchant,
            logoutMerchant,
            createNewService,
            getMerchantServices,
            isLoading
        }}>
            {children}
        </MerchantContext.Provider>
    );
}

export function useMerchant() {
    const context = useContext(MerchantContext);
    if (context === undefined) {
        throw new Error('useMerchant must be used within a MerchantProvider');
    }
    return context;
}
