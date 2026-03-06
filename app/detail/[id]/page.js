// app/products/detail/[id]/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Minus, Plus, X, MessageSquare, Trash2 } from 'lucide-react';
import Sidebar from '@/components/sections/Sidebar';
import MobileNav from '@/components/MobileNav';
import Footer from '@/components/sections/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import FAQAccordion from '@/components/FAQAccordion';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema-markup';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  // Update images when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const colorImages = product.images?.[selectedColor];
      if (colorImages && colorImages.length > 0) {
        // Create array with primary image first, then gallery images (up to 3 total)
        const images = [
          product.primaryImage,           // Index 0: Main image
          ...colorImages.slice(0, 3)      // Index 1,2,3: Gallery images (max 3)
        ];
        setProductImages(images);
        // Set selected image to primary image (index 0) for main display
        setSelectedImage(0);
      } else {
        // Fallback to just primary image
        setProductImages([product.primaryImage].filter(Boolean));
        setSelectedImage(0);
      }
    }
  }, [product, selectedColor]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching product details for ID:', productId);

      // Fetch from MongoDB API
      const response = await fetch(`/api/products?id=${productId}`);
      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.products.length > 0) {
        const foundProduct = data.products[0];
        console.log('Found product:', foundProduct);
        setProduct(foundProduct);

        if (foundProduct.colors && foundProduct.colors.length > 0) {
          setSelectedColor(foundProduct.colors[0]);
          const colorImages = foundProduct.images?.[foundProduct.colors[0]];
          if (colorImages && colorImages.length > 0) {
            const images = [
              foundProduct.primaryImage,
              ...colorImages.slice(0, 3)
            ];
            setProductImages(images);
            setSelectedImage(0);
          } else {
            setProductImages([foundProduct.primaryImage].filter(Boolean));
            setSelectedImage(0);
          }
        } else {
          setProductImages([foundProduct.primaryImage].filter(Boolean));
          setSelectedImage(0);
        }
      } else {
        console.log('Product not found in database');
        toast.error('Product not found');
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product details');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewerName.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          reviewerName: reviewForm.reviewerName,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewForm({ reviewerName: '', rating: 5, comment: '' });
        fetchReviews();
        fetchProductDetails();
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Review deleted');
        fetchReviews();
        fetchProductDetails();
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      _id: product._id || product.id,
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      image: product.primaryImage || product.image,
    }, quantity, selectedColor);
  };

  const getColorCode = (colorName) => {
    const colors = {
      Azure: '#007FFF',
      Celeste: '#B2FFFF',
      Charcoal: '#36454F',
      Coffee: '#6F4E37',
      Coral: '#FF7F50',
      Fern: '#4F7942',
      Innocent: '#F5F5DC',
      'Sand Castle': '#D8C59F',
      Pink: '#FFC0CB',
      Blue: '#4169E1',
      Green: '#228B22',
      White: '#FFFFFF',
      Black: '#000000',
      Natural: '#A67B5B',
      Walnut: '#5C4033',
      Bamboo: '#906F5D',
      'Natural Wood': '#8B5A2B',
      Terracotta: '#E2725B',
      Multi: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1)',
    };
    return colors[colorName] || '#CCCCCC';
  };

  // Get text color based on background color (for better contrast)
  const getTextColorForBackground = (bgColor) => {
    // For light colors, return dark text; for dark colors, return light text
    const lightColors = ['#B2FFFF', '#F5F5DC', '#D8C59F', '#EFDECD', '#FFC0CB', '#FFFFFF', '#FFFDD0'];
    if (lightColors.includes(bgColor)) {
      return '#131212'; // dark text for light backgrounds
    }
    return '#FFFFFF'; // white text for dark backgrounds
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <MobileNav />
        <div className="lg:ml-[280px] flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#fbb710] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <MobileNav />
        <div className="lg:ml-[280px] flex items-center justify-center min-h-screen">
          <div className="text-center px-4">
            <h1 className="text-xl font-heading font-semibold text-[#131212] mb-2">
              Product not found
            </h1>
            <p className="text-sm text-[#6b6b6b] mb-4">
              The product you are looking for does not exist.
            </p>
            <Link
              href="/shop"
              className="inline-block px-4 py-2 bg-[#fbb710] text-white text-sm hover:bg-[#52dd28ff] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <MobileNav />

      {/* Structured Data - valid in App Router client component */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(product))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(`/detail/${productId}`))
        }}
      />

      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        <div className="h-14 lg:hidden"></div>

        {/* Breadcrumb - Mobile Optimized */}
        <div className="px-3 sm:px-4 lg:px-8 py-3 text-[10px] sm:text-xs font-medium tracking-wide text-[#6b6b6b] flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#131212] transition-colors">
            HOME
          </Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-[#131212] transition-colors">
            SHOP
          </Link>
          <span>&gt;</span>
          <Link href={`/shop#${product.category}`} className="hover:text-[#131212] transition-colors capitalize">
            {product.category}
          </Link>
          <span>&gt;</span>
          <span className="text-[#131212] truncate max-w-[120px] sm:max-w-none">{product.name}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-3 sm:px-4 lg:px-8 pb-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Image Gallery */}
            <div className="w-full lg:max-w-[450px]">
              <div className="w-full aspect-square overflow-hidden bg-[#f5f7fa] mb-2 sm:mb-3 lg:mb-4">
                <img
                  src={productImages[selectedImage] || product.primaryImage || product.image}
                  alt={`${product.name} - ${selectedColor} - View ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Thumbnail Images - Exactly 3 boxes */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-3 gap-1 sm:gap-2 lg:gap-3 mb-4">
                  {productImages.slice(1).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i + 1)}
                      className={`aspect-square overflow-hidden border-2 transition-colors ${selectedImage === i + 1 ? 'border-[#fbb710]' : 'border-transparent hover:border-[#ebebeb]'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${selectedColor} - Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 max-w-[500px] pt-2 lg:pt-4">
              {/* Price bar */}
              <div className="w-8 sm:w-10 lg:w-12 h-[2px] sm:h-[3px] bg-[#fbb710] mb-3 sm:mb-4" />

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#131212] mb-2 lg:mb-3">
                {product.name}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#fbb710] mb-1">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs sm:text-sm text-[#6b6b6b] line-through mb-2">
                  {formatPrice(product.originalPrice)}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(averageRating || product.rating || 0)
                        ? 'fill-[#fbb710] text-[#fbb710]'
                        : i < Math.ceil(averageRating || product.rating || 0)
                          ? 'fill-[#fbb710]/50 text-[#fbb710]'
                          : 'text-gray-300'
                        }`}
                    />
                  ))}
                  <span className="ml-1 sm:ml-2 text-[10px] sm:text-sm font-semibold text-[#fbb710]">
                    {averageRating > 0 ? averageRating : (product.rating || 0)}/5
                  </span>
                  <span className="ml-1 text-[10px] sm:text-sm text-[#6b6b6b]">
                    ({reviews.length || product.reviews || 0} reviews)
                  </span>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-[10px] sm:text-sm text-[#6b6b6b] hover:text-[#fbb710] underline"
                >
                  Write A Review
                </button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                  style={{ backgroundColor: product.inStock ? '#22c55e' : '#ef4444' }}
                />
                <span className="text-xs sm:text-sm text-[#6b6b6b]">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#6b6b6b] leading-relaxed mb-6 sm:mb-8">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-medium text-[#131212] mb-2 sm:mb-3">
                    Color:
                    <span
                      className="ml-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium"
                      style={{
                        backgroundColor: getColorCode(selectedColor),
                        color: getTextColorForBackground(getColorCode(selectedColor))
                      }}
                    >
                      {selectedColor}
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border-2 transition-all ${selectedColor === color
                          ? 'border-[#131212] ring-2 ring-[#fbb710] scale-110'
                          : 'border-gray-300 hover:scale-110'
                          }`}
                        style={{
                          backgroundColor: getColorCode(color),
                          color: getTextColorForBackground(getColorCode(color))
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Qty Selector */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <span className="text-xs sm:text-sm font-medium text-[#131212]">Qty</span>
                <div className="flex items-center border border-[#ebebeb]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 sm:p-2 hover:bg-[#f5f7fa] transition-colors"
                    disabled={!product.inStock}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-[#6b6b6b]" />
                  </button>
                  <span className="w-8 sm:w-12 text-center text-xs sm:text-sm font-medium text-[#131212]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 sm:p-2 hover:bg-[#f5f7fa] transition-colors"
                    disabled={!product.inStock}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-[#6b6b6b]" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full h-10 sm:h-12 lg:h-14 bg-[#fbb710] text-white text-xs sm:text-sm lg:text-base font-semibold hover:bg-[#52dd28ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#52dd28ff] flex items-center justify-center gap-1 sm:gap-2"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {product.inStock ? 'Add to cart' : 'Out of Stock'}
              </button>

              {/* Product Meta */}
              <div className="border-t border-[#ebebeb] pt-4 sm:pt-5 lg:pt-6 mt-4 sm:mt-5 lg:mt-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[10px] sm:text-sm">
                  <div>
                    <span className="font-medium text-[#131212]">Category:</span>
                    <span className="text-[#6b6b6b] ml-1 sm:ml-2 capitalize">{product.category}</span>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <FAQAccordion faqs={product.faqs} />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-6 sm:mt-12 border-t border-[#ebebeb] pt-5 sm:pt-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-[#131212] flex items-center gap-1.5 sm:gap-2">
                <MessageSquare className="w-4 h-4 sm:w-10 sm:h-10 text-[#fbb710]" />
                Customer Reviews ({reviews.length})
              </h2>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#fbb710] text-white text-[10px] sm:text-sm font-semibold hover:bg-[#52dd28ff] transition-colors rounded-box"
              >
                Write A Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8 bg-[#f5f7fa] rounded-lg">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-[#6b6b6b] mb-3">No reviews yet. Be the first to review this product!</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-sm text-[#fbb710] hover:text-[#52dd28ff] underline font-medium"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {reviews.map((review, index) => (
                  <div key={review._id || index} className="border border-[#ebebeb] rounded-lg p-3 sm:p-5">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#fbb710] rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                          {review.reviewerName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#131212] line-clamp-1">{review.reviewerName}</p>
                          <p className="text-[9px] sm:text-[10px] text-[#6b6b6b]">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < review.rating ? 'fill-[#fbb710] text-[#fbb710]' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-sm text-[#6b6b6b] leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
        <ScrollToTop visible={showScrollTop} />
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReviewModal(false)}>
          <div
            className="bg-white rounded-lg w-full max-w-md p-5 sm:p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#131212] mb-1">Write a Review</h3>
            <p className="text-xs text-[#6b6b6b] mb-5">for {product.name}</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[#131212] mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-[#ebebeb] text-sm focus:outline-none focus:border-[#fbb710] rounded"
                  required
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-medium text-[#131212] mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${star <= reviewForm.rating
                          ? 'fill-[#fbb710] text-[#fbb710]'
                          : 'text-gray-300 hover:text-[#fbb710]'
                          }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[#6b6b6b]">{reviewForm.rating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-medium text-[#131212] mb-1">Your Review</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-[#ebebeb] text-sm focus:outline-none focus:border-[#fbb710] rounded resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-[#fbb710] text-white text-sm font-semibold hover:bg-[#52dd28ff] transition-colors disabled:opacity-50 rounded"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}