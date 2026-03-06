'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface WishlistItem {
    _id: string;
    id?: string | number;
    name: string;
    price: number;
    image: string;
    originalPrice?: number;
    colors?: string[];
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    wishlistCount: number;
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Load wishlist from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                setWishlistItems(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    }, []);

    // Save wishlist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            setWishlistCount(wishlistItems.length);
        } catch (error) {
            console.error('Error saving wishlist:', error);
        }
    }, [wishlistItems]);

    const addToWishlist = (product: any) => {
        if (!product) return;
        const productId = product._id || product.id;
        if (!productId) return;

        setWishlistItems(prev => {
            const exists = prev.find(item => (item._id || item.id) === productId);
            if (exists) {
                return prev.filter(item => (item._id || item.id) !== productId);
            }
            return [...prev, {
                _id: productId,
                id: product.id || productId,
                name: product.name,
                price: product.price,
                image: product.primaryImage || product.image || '/images/product-chai-cups.jpg',
                originalPrice: product.originalPrice,
                colors: product.colors,
            }];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
        toast.info('Removed from wishlist');
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => (item._id || item.id) === productId);
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
