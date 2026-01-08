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
    iconId: string; // Changed from icon: IconType to iconId: string
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

    // Save to localStorage whenever subscriptions change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
        updateMonthlyData();
    }, [subscriptions]);

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

    const updateMonthlyData = () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

        setMonthlyData(prev => {
            const updated = { ...prev, [currentMonth]: total };
            localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    // Generate historical data for the chart (6 months including current month)
    const getHistoricalData = useCallback(() => {
        const months = [];
        const now = new Date();
        const currentMonthTotal = getMonthlyTotal();

        // Generate data for last 6 months (including current)
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(now.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            // Use stored data if available, otherwise use dummy baseline
            let value;
            if (monthlyData[monthKey]) {
                value = monthlyData[monthKey];
            } else {
                // Dummy baseline values that grow towards current month
                const dummyBaseline = [45, 52, 48, 70, 65, 85];
                const index = 5 - i; // Map to dummy array
                value = dummyBaseline[index] || 50;

                // If we have current subscriptions, blend in some of that value
                if (currentMonthTotal > 0 && i === 0) {
                    value = currentMonthTotal;
                }
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
