'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sections/Sidebar';
import MobileNav from '@/components/MobileNav';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    const [privacy, setPrivacy] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrivacy = async () => {
            try {
                const response = await fetch('/api/admin/settings');
                const data = await response.json();
                if (data.success) {
                    setPrivacy(data.settings.policies.privacyPolicy);
                }
            } catch (error) {
                console.error('Error fetching privacy policy:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrivacy();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <MobileNav />

            <div className="lg:ml-[280px] flex flex-col min-h-screen">
                <div className="h-14 lg:hidden"></div>

                <div className="flex-1 px-4 py-8 sm:px-6 lg:px-12 max-w-4xl">
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center text-[#52dd28ff] hover:text-[#45b824] mb-4 font-medium transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold text-[#131212] tracking-tight flex items-center gap-3">
                            <Lock className="w-8 h-8 text-[#52dd28ff]" />
                            Privacy Policy
                        </h1>
                        <div className="w-20 h-1.5 bg-[#52dd28ff] mt-4 rounded-full"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-[#52dd28ff] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {privacy || 'No privacy policy content found.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
