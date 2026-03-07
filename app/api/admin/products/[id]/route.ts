import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

// PUT - Update product (Admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    await connectDB();

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Support finding by either MongoDB _id or custom numeric id
    const query = mongoose.Types.ObjectId.isValid(productId)
      ? { _id: productId }
      : { id: isNaN(Number(productId)) ? productId : Number(productId) };

    // @ts-ignore - Mongoose typing issue
    const product = await Product.findOneAndUpdate(
      query,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error: any) {
    console.error('Update product error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    await connectDB();

    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Support finding by either MongoDB _id or custom numeric id
    const query = mongoose.Types.ObjectId.isValid(productId)
      ? { _id: productId }
      : { id: isNaN(Number(productId)) ? productId : Number(productId) };

    // @ts-ignore - Mongoose typing issue
    const product = await Product.findOneAndDelete(query);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}