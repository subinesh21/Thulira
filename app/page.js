'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sections/Sidebar';
import MobileNav from '@/components/MobileNav';
import Hero from '@/components/sections/Hero';
import CategoryGrid from '@/components/sections/CategoryGrid';
import Footer from '@/components/sections/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { generateHomeSchema } from '@/lib/schema-markup';

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHomeSchema())
        }}
      />
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        <div className="h-14 lg:hidden"></div>

        <div className="flex-1 flex flex-col">
          <Hero />
          <CategoryGrid />
        </div>

        <Footer />
      </div>

      <ScrollToTop visible={showScrollTop} />
    </div>
  );
}