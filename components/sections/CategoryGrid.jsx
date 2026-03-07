'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, getProductsByCategory } from '@/lib/product-data';

export default function CategoryGrid() {
  const [categoryPrices, setCategoryPrices] = useState({});
  const gridRef = useRef(null);

  useEffect(() => {
    // Calculate minimum price for each category
    const prices = {};
    CATEGORIES.forEach(category => {
      const products = getProductsByCategory(category.id);
      if (products && products.length > 0) {
        const minPrice = Math.min(...products.map(p => p.price));
        prices[category.id] = minPrice;
      } else {
        prices[category.id] = 199; // Default price
      }
    });
    setCategoryPrices(prices);
  }, []);

  // Grid items are now fetched centrally from lib/product-data.js
  const gridItems = CATEGORIES;

  // Grid span mapping - Different behavior for mobile vs desktop
  const spanMap = {
    tall: 'sm:row-span-2',
    wide: 'sm:col-span-2',
    normal: ''
  };

  // Helper function to get image style based on configuration
  const getImageStyle = (item) => {
    if (item.imageFit === 'cover') {
      return { objectFit: 'cover', objectPosition: item.imagePosition };
    } else if (item.imageFit === 'contain') {
      return { objectFit: 'contain', objectPosition: item.imagePosition };
    } else if (item.imageFit === 'zoom') {
      return {
        objectFit: 'cover',
        objectPosition: item.imagePosition,
        transform: `scale(${item.imageZoom})`,
      };
    }
    return { objectFit: 'cover', objectPosition: 'center' };
  };

  // Helper function to get overlay style
  const getOverlayStyle = (item) => {
    if (item.overlay === 'dark') {
      return `bg-black/${Math.round(item.overlayOpacity * 100)}`;
    } else if (item.overlay === 'light') {
      return `bg-white/${Math.round(item.overlayOpacity * 100)}`;
    }
    return '';
  };

  // Helper function to get text position classes
  const getTextPosition = (position) => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-0 left-0';
    }
  };

  return (
    <section className="bg-background w-full flex flex-col min-h-[calc(100vh-56px)] lg:min-h-screen">
      {/* Main Grid - uses flex-1 to fill parent vertically, grid rows stretch automatically */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-0 flex-1 w-full"
        style={{ gridAutoRows: '1fr' }}
      >
        {gridItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className={`group relative block overflow-hidden cursor-pointer 
              ${spanMap[item.gridSpan]}`}
          >
            <Link href={`/products#${item.id}`} className="block h-full">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.customName || item.name} - eco-friendly products by Thulira`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="transition-transform duration-700 group-hover:scale-110"
                  style={getImageStyle(item)}
                  priority={index < 2}
                  onError={(e) => {
                    e.currentTarget.srcset = '';
                    e.currentTarget.src = '/images/product-chai-cups.jpg';
                    e.currentTarget.style.objectFit = 'cover';
                  }}
                />

                {/* Custom overlay */}
                <div className={`absolute inset-0 ${getOverlayStyle(item)} transition-colors duration-300`} />

                {/* Additional hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </div>

              {/* Text overlay with responsive sizing */}
              <div className={`absolute ${getTextPosition(item.textPosition)} ${item.padding}`}>
                {/* Green accent bar - smaller on mobile */}
                <div className="w-6 sm:w-8 md:w-10 h-[2px] sm:h-[2px] md:h-[3px] bg-[#52dd28ff] mb-1 sm:mb-1 md:mb-3" />

                {/* Price - smaller on mobile */}
                <p className="font-mono text-[10px] sm:text-xs md:text-sm text-white font-medium mb-1">
                  From ₹{item.price}
                </p>

                {/* Mobile version - visible only on mobile */}
                <h6 className="text-sm font-semibold text-white leading-tight block lg:hidden" style={{ fontFamily: 'var(--font-cinzel), serif', letterSpacing: '1.5px' }}>
                  {item.customName || item.name}
                </h6>

                {/* Desktop version - visible only on desktop */}
                <h3 className="text-lg font-semibold text-white leading-tight hidden lg:block" style={{ fontFamily: 'var(--font-cinzel), serif', letterSpacing: '2px' }}>
                  {item.customName || item.name}
                </h3>
                {/* Product count - smaller on mobile */}
                <p className="font-mono text-[8px] sm:text-[10px] md:text-xs text-white/80 mt-0.5 sm:mt-1">
                  {item.count} Products
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}