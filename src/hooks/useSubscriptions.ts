import { useState, useEffect, useCallback } from 'react';
import { IconType } from 'react-icons';

export interface ActiveSubscription {
    id: string;
    serviceId: string;
    serviceName: string;
    plan: string;
    price: number;
    email: string;
    startDate: string;
    nextBilling: string;
    color: string;
    icon: IconType;
    transactionSignature?: string; // Add transaction ID
}

interface MonthlyData {
    [month: string]: number;
}

const STORAGE_KEY = 'cadpay-subscriptions';
const MONTHLY_DATA_KEY = 'cadpay-monthly-data';

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData>({});

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const monthlyStored = localStorage.getItem(MONTHLY_DATA_KEY);

        if (stored) {
            setSubscriptions(JSON.parse(stored));
        }

        if (monthlyStored) {
            setMonthlyData(JSON.parse(monthlyStored));
        }
    }, []);

    // Update monthly data helper - must be before useEffect that uses it
    const updateMonthlyData = useCallback(() => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

        setMonthlyData(prev => {
            const updated = { ...prev, [currentMonth]: total };
            localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [subscriptions]);

    // Save to localStorage whenever subscriptions change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
        updateMonthlyData();
    }, [subscriptions, updateMonthlyData]);

    const addSubscription = useCallback((subscription: Omit<ActiveSubscription, 'id' | 'startDate' | 'nextBilling'>) => {
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const newSub: ActiveSubscription = {
            ...subscription,
            id: `${subscription.serviceId}-${Date.now()}`,
            startDate: now.toISOString(),
            nextBilling: nextMonth.toISOString()
        };

        setSubscriptions(prev => [...prev, newSub]);
        return newSub;
    }, []);

    const removeSubscription = useCallback((id: string) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }, []);

    const getMonthlyTotal = useCallback(() => {
        return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    }, [subscriptions]);



    // Generate simulated historical data for the chart (last 6 months)
    const getHistoricalData = useCallback(() => {
        const months = [];
        const now = new Date();
        // Start from 5 months ago (to show 6 months total including current)
        const baseDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const currentMonthTotal = getMonthlyTotal();

        // Generate data for last 6 months
        for (let i = 0; i < 6; i++) {
            const date = new Date(baseDate);
            date.setMonth(baseDate.getMonth() + i);
            const monthKey = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            // Use stored data if available, otherwise simulate gradual growth
            let value;
            if (monthlyData[monthKey]) {
                value = monthlyData[monthKey];
            } else {
                // Simulate growth from 40% to 100% of current total  
                const growthFactor = 0.4 + (i / 5) * 0.6;
                value = currentMonthTotal * growthFactor;
            }

            months.push({
                month: monthName,
                amount: parseFloat(value.toFixed(2))
            });
        }

        return months;
    }, [monthlyData, getMonthlyTotal]);

    const checkDuplicateEmail = useCallback((serviceId: string, email: string) => {
        return subscriptions.some(sub => sub.serviceId === serviceId && sub.email.toLowerCase() === email.toLowerCase());
    }, [subscriptions]);

    return {
        subscriptions,
        addSubscription,
        removeSubscription,
        getMonthlyTotal,
        getHistoricalData,
        checkDuplicateEmail
    };
}
