'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShoppingBag, CreditCard, MapPin, Phone, User,
  CheckCircle, ShoppingCart, AlertCircle, Loader, Truck,
  Percent, Mail, Image as ImageIcon, X
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/sections/Sidebar';
import MobileNav from '@/components/MobileNav';
import Footer from '@/components/sections/Footer';
import { toast } from 'react-toastify';
import { DeliveryCalculator } from '@/lib/delivery-calculator';
import { GSTCalculator } from '@/lib/gst-calculator';


declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State management
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  const handleImageError = (id: string, color?: string | null) => {
    const key = `${id}-${color || 'default'}`;
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const CheckoutImageSkeleton = () => (
    <div className="w-16 h-16 bg-[#f0f2f5] animate-pulse flex items-center justify-center rounded-box flex-shrink-0">
      <ImageIcon className="w-6 h-6 text-gray-200" />
    </div>
  );

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Shipping info state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<any>({});

  // Calculate pricing
  const itemsTotal = cartTotal;
  const deliveryCost = deliveryInfo ? deliveryInfo.finalCost : 0;
  const gstCalculation = GSTCalculator.calculateWithDelivery(
    cartItems.map(item => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: (item as any).category
    })),
    deliveryCost
  );
  const totalAmount = gstCalculation.grandTotal;

  // Effects
  useEffect(() => {
    if (!isAuthenticated && !loadingProfile) {
      toast.warning('Please login to checkout');
      router.push('/account');
    }
  }, [isAuthenticated, loadingProfile, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          const data = await response.json();
          if (data.user) {
            const addr = data.user.shippingAddress || {};
            setShippingInfo({
              fullName: addr.fullName || data.user.name || '',
              address: addr.address || '',
              city: addr.city || '',
              state: addr.state || '',
              zipCode: addr.zipCode || '',
              country: addr.country || 'India',
              phone: addr.phone || '',
              email: data.user.email || ''
            });

            // Auto-fill the delivery pincode and trigger delivery calculation
            const savedZip = addr.zipCode || '';
            if (savedZip.length === 6) {
              setPincode(savedZip);
              try {
                const info = DeliveryCalculator.calculateDeliveryCost(savedZip, itemsTotal);
                setDeliveryInfo(info);
              } catch (e) {
                // ignore calculation errors
              }
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch store settings for T&C and Privacy Policy
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.success) {
          setStoreSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Load Razorpay SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      // Dynamically load Razorpay SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        toast.error('Payment gateway initialization failed');
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup: remove script when component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  // Handlers
  const validateForm = () => {
    const newErrors: any = {};

    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = 'Invalid pincode (must be 6 digits)';
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!pincode) {
      newErrors.pincode = 'Please enter pincode for delivery calculation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);

    if (value.length === 6) {
      try {
        const info = DeliveryCalculator.calculateDeliveryCost(value, itemsTotal);
        setDeliveryInfo(info);
        setErrors(prev => ({ ...prev, pincode: undefined }));
      } catch (error) {
        setDeliveryInfo(null);
      }
    } else {
      setDeliveryInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    if (!deliveryInfo) {
      toast.error('Please enter valid pincode for delivery calculation');
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is not ready. Please try again.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare items data with proper structure
      const orderItems = cartItems.map(item => ({
        id: item._id || item.productId || item.id,
        productId: item._id || item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: (item as any).category || 'homeware',
        color: item.color || null,
      }));

      // Initialize Razorpay payment
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          customerInfo: {
            ...shippingInfo,
            userId: user?.id || 'guest',
          },
          pincode,
          paymentMethod: 'razorpay'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // Open Razorpay payment modal with proper configuration
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Thulira Sustainable Products',
        description: `Order Payment - ₹${(data.amount / 100).toFixed(2)}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          // Payment successful
          console.log('Payment response:', response);
          await handlePaymentSuccess(response, data.orderData);
        },
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone.replace(/\D/g, '') // Send only digits
        },
        theme: {
          color: '#2d5a3d'
        },
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['qr', 'collect', 'intent'],
                  }
                ],
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.utib', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            setIsPlacingOrder(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        const error = response.error;
        toast.error(`Payment failed: ${error.description || 'Please try again'}`);
        setIsPlacingOrder(false);

        // Optionally update order status in backend
        fetch('/api/payment/razorpay', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: '',
            razorpay_signature: ''
          })
        }).catch(err => console.error('Error updating failed payment:', err));
      });

      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async (razorpayResponse: any, orderData: any) => {
    try {
      // Verify payment signature
      const verifyResponse = await fetch('/api/payment/razorpay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        // Clear cart and show success
        clearCart();

        // Calculate amount from order data
        const amount = ((orderData.pricing?.totalAmount || 0).toFixed(2));

        // Redirect to success page with all details
        router.push(
          `/orders/success?orderId=${orderData.orderId}&invoiceNumber=${verifyData.invoiceNumber}&amount=${amount}&dbOrderId=${verifyData.orderId || ''}`
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const LegalModal = ({ type, onClose, content }: { type: 'terms' | 'privacy', onClose: () => void, content: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-box shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">
            {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto prose prose-sm max-w-none">
          {content ? (
            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
              {content}
            </div>
          ) : (
            <p className="text-gray-400 italic py-10 text-center">Content is currently being updated. Please check back later.</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#52dd28ff] text-white rounded-box font-semibold hover:bg-[#45b824] transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Razorpay SDK loaded');
          setRazorpayLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Razorpay SDK');
        }}
      />

      <div className="min-h-screen bg-[#f9fdfa]">
        <MobileNav />
        <Sidebar />

        {/* Main Content */}
        <main className="pt-16 lg:pl-[280px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8">
              <Link href="/cart" className="inline-flex items-center text-[#52dd28ff] hover:text-[#45b824] mb-4 font-medium transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Cart
              </Link>
              <h1 className="text-4xl font-bold text-[#131212] tracking-tight">Checkout</h1>
              <div className="w-20 h-1.5 bg-[#52dd28ff] mt-4 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">

                {/* Shipping Information */}
                <div className="bg-white rounded-2xl border border-[#ebebeb] p-8 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-bold text-[#131212] mb-8 flex items-center">
                    <User className="w-6 h-6 mr-3 text-[#52dd28ff]" />
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.zipCode ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="123456"
                        maxLength={6}
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="House No., Street, Area"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#131212] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${errors.state ? 'border-red-500' : 'border-[#ebebeb]'
                          } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-500">{errors.state}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-2xl border border-[#ebebeb] p-8 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-2xl font-bold text-[#131212] mb-8 flex items-center">
                    <Truck className="w-6 h-6 mr-3 text-[#52dd28ff]" />
                    Delivery Details
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#131212] mb-1">
                      Enter Pincode for Delivery Calculation *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={handlePincodeChange}
                      className={`w-full max-w-xs px-4 py-3 border ${errors.pincode ? 'border-red-500' : 'border-[#ebebeb]'
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#52dd28ff]/20 focus:border-[#52dd28ff] transition-all bg-gray-50/30`}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
                    )}
                  </div>

                  {deliveryInfo && (
                    <div className="bg-green-50 border border-green-200 rounded-box p-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Delivery Available
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Estimated Delivery: {deliveryInfo.deliveryDays} business days
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Delivery Charges: {deliveryInfo.isFree ? 'FREE' : `₹${deliveryInfo.finalCost}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-[#ebebeb] p-8 sticky top-24 shadow-sm">
                  <h2 className="text-2xl font-bold text-[#131212] mb-8 flex items-center border-b border-[#ebebeb] pb-4">
                    <ShoppingBag className="w-6 h-6 mr-3 text-[#52dd28ff]" />
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 bg-gray-50/50 p-3 rounded-xl border border-[#f0f0f0] transition-colors hover:bg-white hover:border-[#52dd28ff]/30">
                        <div className="relative w-16 h-16 flex-shrink-0 shadow-sm rounded-lg overflow-hidden border border-[#ebebeb]">
                          {imageErrors[`${item._id || item.productId || item.id}-${item.color || 'default'}`] || !item.image ? (
                            <CheckoutImageSkeleton />
                          ) : (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover transition-transform hover:scale-110"
                              onError={() => handleImageError(String(item._id || item.productId || item.id), item.color)}
                            />
                          )}
                          <span className="absolute -top-1 -right-1 bg-[#52dd28ff] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#131212] truncate leading-tight mb-1">
                            {item.name}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#ebebeb] pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-900">₹{itemsTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className="font-semibold text-gray-900">
                        {deliveryInfo ? (deliveryInfo.isFree ? <span className="text-[#52dd28ff]">FREE</span> : `₹${deliveryInfo.finalCost}`) : '-'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST (18%)</span>
                      <span className="font-semibold text-gray-900">₹{gstCalculation.totalGST.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-[#ebebeb] pt-5 mt-5">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-black text-[#52dd28ff]">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Agreement */}
                  <div className="mt-6 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="terms-checkbox" className="text-xs text-gray-600 leading-normal cursor-pointer select-none">
                      I agree to the <button type="button" onClick={() => setLegalModal('terms')} className="text-[#52dd28ff] font-bold hover:underline transition-all">Terms & Conditions</button> and <button type="button" onClick={() => setLegalModal('privacy')} className="text-[#52dd28ff] font-bold hover:underline transition-all">Privacy Policy</button>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPlacingOrder || !deliveryInfo}
                    className={`w-full mt-8 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg relative overflow-hidden group ${isPlacingOrder || !deliveryInfo
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-[#52dd28ff] hover:bg-[#45b824] text-white hover:shadow-[#52dd28ff]/30 active:scale-[0.98]'
                      }`}
                  >
                    {isPlacingOrder ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-6 h-6 animate-spin mr-3" />
                        Processing...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <CreditCard className="w-5 h-5 mr-3" />
                        Pay ₹{totalAmount.toFixed(2)}
                      </span>
                    )}
                  </button>

                  {!deliveryInfo && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please enter pincode to calculate delivery
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>

        <Footer />

        {/* Legal Modals */}
        <AnimatePresence>
          {legalModal === 'terms' && (
            <LegalModal
              type="terms"
              onClose={() => setLegalModal(null)}
              content={storeSettings?.policies?.termsAndConditions || ''}
            />
          )}
          {legalModal === 'privacy' && (
            <LegalModal
              type="privacy"
              onClose={() => setLegalModal(null)}
              content={storeSettings?.policies?.privacyPolicy || ''}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}