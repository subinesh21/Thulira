import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductModel from '@/models/Product';
import { Types } from 'mongoose';
import { requireAdmin } from '@/lib/auth-middleware';

/**
 * GET - Fetch all product state overrides (admin only)
 * Returns a map of productId -> { inStock, isActive }
 */
export async function GET(request: NextRequest) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    await connectDB();

    // Use type assertion to help TypeScript
    const products = await (ProductModel as any).find({})
      .select('_id id inStock isActive')
      .lean();

    // Convert to map format: { productId: { inStock, isActive } }
    const statesMap: Record<string, { inStock: boolean; isActive: boolean }> = {};

    for (const product of products) {
      const productId = product.id?.toString() || product._id.toString();
      statesMap[productId] = {
        inStock: product.inStock,
        isActive: product.isActive
      };
    }

    return NextResponse.json({
      success: true,
      states: statesMap,
      count: products.length
    });

  } catch (error: any) {
    console.error('Error fetching product states:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product states',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Update product state (inStock or isActive) — admin only
 * Creates or updates just the state fields
 */
export async function POST(request: NextRequest) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    await connectDB();

    const body = await request.json();
    const { productId, inStock, isActive } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Build update object with only state fields
    const update: Record<string, any> = {};
    if (inStock !== undefined) update.inStock = inStock;
    if (isActive !== undefined) update.isActive = isActive;
    update.updatedAt = new Date();

    // Try to find by numeric ID first, then by _id
    let updatedProduct;

    // Check if productId is a valid number for numeric ID search
    const numericId = parseInt(productId);
    if (!isNaN(numericId)) {
      updatedProduct = await (ProductModel as any).findOneAndUpdate(
        { id: numericId },
        update,
        { new: true, runValidators: true }
      );
    }

    // If not found by numeric ID, try by MongoDB _id (if valid ObjectId)
    if (!updatedProduct && Types.ObjectId.isValid(productId)) {
      updatedProduct = await (ProductModel as any).findOneAndUpdate(
        { _id: productId },
        update,
        { new: true, runValidators: true }
      );
    }

    // If still not found, create a minimal product entry with just state
    if (!updatedProduct) {
      const productData: Record<string, any> = {
        id: !isNaN(numericId) ? numericId : productId,
        name: `Product ${productId}`,
        price: 0,
        primaryImage: '/images/placeholder.jpg',
        category: 'homeware',
        description: 'Product details not available',
        inStock: inStock !== undefined ? inStock : true,
        isActive: isActive !== undefined ? isActive : true
      };

      updatedProduct = await (ProductModel as any).create(productData);
    }

    return NextResponse.json({
      success: true,
      state: {
        inStock: updatedProduct.inStock,
        isActive: updatedProduct.isActive
      },
      message: 'Product state updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating product state:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update product state',
      },
      { status: 500 }
    );
  }
}