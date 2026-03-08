'use client';

import { useCompare } from '@/context/CompareContext';
import { X, ExternalLink, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CompareModal() {
  const { compareItems, showModal, setShowModal, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (!showModal || compareItems.length < 2) return null;

  const [product1, product2] = compareItems;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
      <div 
        className="bg-white rounded-box w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold font-cinzel text-[#131212]">Product Comparison</h2>
          <div className="flex gap-4">
            <button 
              onClick={clearCompare}
              className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 relative">
            {/* Divider Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 hidden md:block" />

            {/* Product 1 */}
            <div className="flex flex-col gap-4 relative">
              <button 
                onClick={() => removeFromCompare(product1._id || product1.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="relative aspect-square w-full rounded-box overflow-hidden bg-[#f5f7fa]">
                <Image 
                  src={product1.primaryImage || product1.image} 
                  alt={product1.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="text-center">
                <h3 className="font-cinzel font-bold text-lg mb-1 leading-tight">{product1.name}</h3>
                <div className="text-[#52dd28ff] font-bold text-xl">{formatPrice(product1.price)}</div>
              </div>
              
              <div className="space-y-4 text-sm mt-4 lg:px-4">
                <div className="pb-4 border-b">
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Stock Status</span>
                  <span className={`font-medium ${product1.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {product1.inStock ? (
                      <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> In Stock</span>
                    ) : 'Out of Stock'}
                  </span>
                </div>
                <div className="pb-4 border-b">
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Category</span>
                  <span className="capitalize">{product1.category}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Colors Available</span>
                  <div className="flex justify-center flex-wrap gap-1.5">
                    {product1.colors?.length > 0 ? (
                      product1.colors.map(c => (
                        <div key={c} className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: c.toLowerCase() }} title={c} />
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Standard</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 flex gap-2">
                <button 
                  onClick={() => addToCart({
                    _id: product1._id || product1.id,
                    id: product1.id || product1._id,
                    name: product1.name,
                    price: product1.price,
                    image: product1.primaryImage || product1.image,
                  }, 1, product1.colors?.[0] || null)}
                  disabled={!product1.inStock}
                  className="flex-1 py-2 bg-[#52dd28ff] hover:bg-black text-white font-medium rounded-box transition-colors disabled:opacity-50 text-sm"
                >
                  Add to Cart
                </button>
                <Link href={`/detail/${product1._id || product1.id}`} className="flex items-center justify-center p-2 border hover:bg-gray-50 rounded-box transition-colors">
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Product 2 */}
            <div className="flex flex-col gap-4 relative">
              <button 
                onClick={() => removeFromCompare(product2._id || product2.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="relative aspect-square w-full rounded-box overflow-hidden bg-[#f5f7fa]">
                <Image 
                  src={product2.primaryImage || product2.image} 
                  alt={product2.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="text-center">
                <h3 className="font-cinzel font-bold text-lg mb-1 leading-tight">{product2.name}</h3>
                <div className="text-[#52dd28ff] font-bold text-xl">{formatPrice(product2.price)}</div>
              </div>
              
              <div className="space-y-4 text-sm mt-4 lg:px-4">
                <div className="pb-4 border-b">
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Stock Status</span>
                  <span className={`font-medium ${product2.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {product2.inStock ? (
                      <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> In Stock</span>
                    ) : 'Out of Stock'}
                  </span>
                </div>
                <div className="pb-4 border-b">
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Category</span>
                  <span className="capitalize">{product2.category}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Colors Available</span>
                  <div className="flex justify-center flex-wrap gap-1.5">
                    {product2.colors?.length > 0 ? (
                      product2.colors.map(c => (
                        <div key={c} className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: c.toLowerCase() }} title={c} />
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Standard</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-2">
                <button 
                  onClick={() => addToCart({
                    _id: product2._id || product2.id,
                    id: product2.id || product2._id,
                    name: product2.name,
                    price: product2.price,
                    image: product2.primaryImage || product2.image,
                  }, 1, product2.colors?.[0] || null)}
                  disabled={!product2.inStock}
                  className="flex-1 py-2 bg-[#52dd28ff] hover:bg-black text-white font-medium rounded-box transition-colors disabled:opacity-50 text-sm"
                >
                  Add to Cart
                </button>
                <Link href={`/detail/${product2._id || product2.id}`} className="flex items-center justify-center p-2 border hover:bg-gray-50 rounded-box transition-colors">
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
