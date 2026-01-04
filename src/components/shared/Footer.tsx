'use client';

import { SiDiscord, SiGithub, SiX, SiLinkedin, SiYoutube } from 'react-icons/si';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className="relative bg-[#1c1209] pt-24 pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* THE "GIVE US A FOLLOW" CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full bg-orange-500 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl mb-24 relative overflow-hidden"
                >
                    {/* Background Pattern */}
                    {/* Background Pattern - Removed noise.png */}

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Give us a follow</h2>
                            <p className="text-orange-100 max-w-xl mx-auto text-lg">
                                Stay up to date with the latest features, releases, and ecosystem news—created just for you.
                            </p>
                        </div>

                        {/* SOCIAL ICONS */}
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                            <SocialIcon href="#" icon={<SiX size={24} />} label="X (Twitter)" />
                            <SocialIcon href="#" icon={<SiDiscord size={28} />} label="Discord" />
                            <SocialIcon href="#" icon={<SiGithub size={24} />} label="GitHub" />
                            <SocialIcon href="#" icon={<SiLinkedin size={24} />} label="LinkedIn" />
                            <SocialIcon href="#" icon={<SiYoutube size={24} />} label="YouTube" />
                        </div>
                    </div>
                </motion.div>

                {/* FOOTER LINKS */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 border-t border-white/10 pt-16">

                    {/* BRAND COL */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link href="/" className="font-black italic tracking-tighter text-2xl text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center rounded-sm not-italic text-lg">C</div>
                            CADPAY
                        </Link>
                    </div>

                    {/* COLS */}
                    <FooterColumn title="Product">
                        <FooterLink href="#">Features</FooterLink>
                        <FooterLink href="#">Integrations</FooterLink>
                        <FooterLink href="#">Documentation</FooterLink>
                        <FooterLink href="#">Pricing</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Resources">
                        <FooterLink href="#">Community</FooterLink>
                        <FooterLink href="#">Help Center</FooterLink>
                        <FooterLink href="#">Status</FooterLink>
                        <FooterLink href="#">Media Kit</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Company">
                        <FooterLink href="#">About</FooterLink>
                        <FooterLink href="#">Blog</FooterLink>
                        <FooterLink href="#">Careers</FooterLink>
                        <FooterLink href="#">Contact</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Legal">
                        <FooterLink href="#">Privacy</FooterLink>
                        <FooterLink href="#">Terms</FooterLink>
                        <FooterLink href="#">Security</FooterLink>
                    </FooterColumn>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                    <p>© 2026 CadPay. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Made with 🧡 on Solana</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}

function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="w-14 h-14 md:w-16 md:h-16 bg-white text-orange-600 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all duration-300"
        >
            {icon}
        </a>
    );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white tracking-wide">{title}</h3>
            <div className="flex flex-col gap-3">
                {children}
            </div>
        </div>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-zinc-400 hover:text-orange-400 transition-colors text-sm font-medium">
            {children}
        </Link>
    );
}
