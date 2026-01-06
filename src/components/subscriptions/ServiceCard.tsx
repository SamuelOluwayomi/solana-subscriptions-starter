'use client';

import { motion } from 'framer-motion';
import { Service } from '@/data/subscriptions';

interface ServiceCardProps {
    service: Service;
    onClick: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
    const minPrice = Math.min(...service.plans.map(p => p.price));

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative bg-zinc-900/50 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all hover:border-white/20 group overflow-hidden"
            style={{
                boxShadow: `0 0 20px ${service.color}20`
            }}
        >
            {/* Color accent */}
            <div
                className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: service.color }}
            />

            {/* Service icon */}
            <div
                className="text-5xl mb-4 p-4 rounded-xl inline-block items-center justify-center w-20 h-20"
                style={{ backgroundColor: `${service.color}15`, color: service.color }}
            >
                <service.icon size={48} />
            </div>

            {/* Service info */}
            <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
            <p className="text-sm text-zinc-400 mb-4">{service.description}</p>

            {/* Price badge */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">{service.category}</span>
                <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                        backgroundColor: `${service.color}20`,
                        color: service.color
                    }}
                >
                    ${minPrice === 0 ? 'Free' : `${minPrice}/mo`}
                </div>
            </div>

            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ backgroundColor: service.color }}
            />
        </motion.div>
    );
}
