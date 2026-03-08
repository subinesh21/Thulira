'use client';

import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

export const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addToCompare = (product) => {
    setCompareItems((prev) => {
      // Check if already in compare list
      const isAlreadyAdded = prev.some(item => (item._id || item.id) === (product._id || product.id));
      if (isAlreadyAdded) {
        toast.info(`${product.name} is already in comparison`);
        return prev;
      }
      
      const newItems = [...prev, product];
      
      if (newItems.length === 2) {
        setShowModal(true);
        return newItems;
      } else if (newItems.length > 2) {
        toast.info("You can only compare 2 products at a time. Showing comparison.");
        setShowModal(true);
        return prev; // keep the max at 2
      } else {
        toast.success(`Added ${product.name} to comparison`);
      }
      
      return newItems;
    });
  };

  const removeFromCompare = (productId) => {
    setCompareItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    setShowModal(false);
  };

  const clearCompare = () => {
    setCompareItems([]);
    setShowModal(false);
  };

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      showModal,
      setShowModal
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
