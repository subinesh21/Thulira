// components/ProductCard.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, categoryImage, viewMode = 'grid' }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      _id: product._id || product.id,
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.primaryImage || product.image,
    }, 1, product.colors?.[0] || null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get the current image based on hover state
  const getCurrentImage = () => {
    if (isHovered && product.hoverImage) {
      return product.hoverImage;
    }
    return product.primaryImage || product.image || categoryImage || '/images/product-chai-cups.jpg';
  };

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div
        className="flex bg-white border border-gray-100 rounded-box overflow-hidden"
      >
        {/* Image */}
        <Link href={`/detail/${product._id || product.id}`} className="flex-shrink-0 w-32 sm:w-40 lg:w-48">
          <div className="relative h-full bg-[#f5f7fa] overflow-hidden">
            <img
              src={getCurrentImage()}
              alt={`${product.name} - Thulira sustainable product`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = categoryImage || '/images/product-chai-cups.jpg';
              }}
            />
            {!product.inStock && (
              <div className="absolute top-2 left-2 bg-gray-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                Out of Stock
              </div>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <Link href={`/detail/${product._id || product.id}`}>
              <h5 className="text-sm sm:text-base font-medium text-black line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                {product.name}
              </h5>
            </Link>
            {product.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2 hidden sm:block">
                {product.description}
              </p>
            )}
            {/* Color options */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 5 && (
                  <span className="text-[8px] lg:text-xs text-[#6b6b6b]">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#fbb710] font-semibold text-sm sm:text-base">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-[#6b6b6b] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="p-2 bg-[#f5f7fa] rounded-full text-[#131212] disabled:opacity-50"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW (default)
  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/detail/${product._id || product.id}`}>
        <div className="relative aspect-square bg-[#f5f7fa] overflow-hidden mb-2 sm:mb-3 lg:mb-4">
          <img
            src={getCurrentImage()}
            alt={`${product.name} - Thulira sustainable product`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.src = categoryImage || '/images/product-chai-cups.jpg';
            }}
          />

          {/* Quick Actions - visible on hover */}
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 0',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
              pointerEvents: isHovered ? 'auto' : 'none'
            }}
          >
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-[#131212] hover:text-[#fbb710] hover:shadow-lg transition-all duration-300 disabled:opacity-50 transform hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/detail/${product._id || product.id}`); }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-[#131212] hover:text-[#fbb710] hover:shadow-lg transition-all duration-300 transform hover:scale-110"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToWishlist(product); }}
              className={`w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-110 ${isInWishlist(product._id || product.id) ? 'text-red-500' : 'text-[#131212] hover:text-[#fbb710]'
                }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist(product._id || product.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute top-2 left-2 bg-gray-500 text-white text-[10px] lg:text-xs font-medium px-1.5 lg:px-2 py-0.5 lg:py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>
      </Link>

      <Link href={`/detail/${product._id || product.id}`}>
        {/* Mobile version */}
        <h6
          className="block lg:hidden text-black font-medium line-clamp-2 mb-1 group-hover:text-[#fbb710] transition-colors"
          style={{ fontSize: '15px', fontFamily: 'var(--font-cinzel), serif' }}
        >
          {product.name}
        </h6>

        {/* Desktop version */}
        <h5
          className="hidden lg:block text-black font-medium line-clamp-2 mb-2 group-hover:text-[#fbb710] transition-colors"
          style={{ fontSize: '16px', fontFamily: 'var(--font-cinzel), serif' }}
        >
          {product.name}
        </h5>
      </Link>

      <div className="flex items-center gap-1 lg:gap-2">
        <span className="text-[#fbb710] font-semibold text-xs sm:text-sm lg:text-base">
          {formatPrice(product.price)}
        </span>
        {product.originalPrice && (
          <span className="text-[10px] sm:text-xs text-[#6b6b6b] line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Color options */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex flex-wrap gap-0.5 lg:gap-1 mt-1 lg:mt-2">
          {product.colors.slice(0, 3).map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
          {product.colors.length > 3 && (
            <span className="text-[8px] lg:text-xs text-[#6b6b6b]">
              +{product.colors.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}