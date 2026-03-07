'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import Sidebar from '@/components/sections/Sidebar';
import Footer from '@/components/sections/Footer';
import MobileNav from '@/components/MobileNav';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { CATEGORY_INFO, CATEGORIES } from '@/lib/product-data';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load products from MongoDB
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?isActive=true');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products.reverse());
        } else {
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(lowerQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerQuery)) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  });

  // Group filtered products by category
  const groupedProducts = {};
  if (!loading && filteredProducts.length > 0) {
    filteredProducts.forEach(product => {
      if (!groupedProducts[product.category]) {
        groupedProducts[product.category] = [];
      }
      groupedProducts[product.category].push(product);
    });
  }

  // Handle immediate scrolling after load completes
  useEffect(() => {
    if (!loading) {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const yOffset = -100; // offset for headers
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 100);
        }
      } else if (searchQuery) {
        const element = document.getElementById('products-container');
        if (element) {
          setTimeout(() => {
            const yOffset = -40;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [loading, searchQuery, searchParams]);

  const categoryOrder = CATEGORIES.map(c => c.id);

  if (loading) {
    return (
      <div className="flex-1 container mx-auto px-3 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 sm:h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="products-container" className="flex-1 container mx-auto px-3 sm:px-6 py-8">
      {searchQuery && (
        <div className="mb-6 pb-6 border-b border-[#ebebeb]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#131212]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            Search Results for &quot;<span className="text-[#52dd28ff]">{searchQuery}</span>&quot;
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-2">Found {filteredProducts.length} product(s)</p>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <span className="text-xs text-[#6b6b6b] mr-1">View:</span>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1.5 rounded-box transition-colors ${viewMode === 'grid' ? 'bg-[#52dd28ff] text-white' : 'text-[#6b6b6b] hover:text-[#52dd28ff] border border-[#ebebeb]'}`}
          title="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-box transition-colors ${viewMode === 'list' ? 'bg-[#52dd28ff] text-white' : 'text-[#6b6b6b] hover:text-[#52dd28ff] border border-[#ebebeb]'}`}
          title="List View"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Products by Category */}
      <div className="space-y-12">
        {categoryOrder.map(categoryId => {
          const categoryProducts = groupedProducts[categoryId] || [];
          const categoryData = CATEGORY_INFO[categoryId];

          if (categoryProducts.length === 0) return null;

          return (
            <section key={categoryId} id={categoryId} className="scroll-mt-24">
              {/* Category Header - Mobile Optimized */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#131212]" style={{ fontFamily: 'var(--font-cinzel), serif', letterSpacing: '1.5px' }}>
                    {categoryData?.name || categoryId}
                  </h2>
                  <div className="flex-1 h-px bg-[#ebebeb]"></div>
                </div>
                {!searchQuery && (
                  <p className="text-xs sm:text-sm text-[#6b6b6b]">
                    {categoryData?.description || `${categoryProducts.length} products`}
                  </p>
                )}
              </div>

              {/* Products Grid/List - Using ProductCard component */}
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                : "flex flex-col gap-3 sm:gap-4"
              }>
                {categoryProducts.map((product, index) => (
                  <motion.div
                    key={product._id || product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      categoryImage={categoryData?.image}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* No Products Message */}
      {Object.keys(groupedProducts).length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-base sm:text-lg font-medium text-[#131212] mb-2">No products match your search.</h3>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">Try searching for something else or browse our categories.</p>
          <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-[#52dd28ff] text-white rounded hover:bg-[#45b922] transition-colors">
            View All Products
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        <div className="h-14 lg:hidden"></div>
        <Suspense fallback={
          <div className="flex-1 container mx-auto px-3 sm:px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 w-64 mb-8"></div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-48 sm:h-64 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <ProductsContent />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}