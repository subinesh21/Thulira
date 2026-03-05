import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ProductModel from '@/models/Product';
import { Types } from 'mongoose';

// PUT - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await the params
    const { id } = await params;
    const body = await request.json();

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Update product - using a type assertion to help TypeScript
    const updatedProduct = await (ProductModel as any).findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await the params
    const { id } = await params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Delete product - using a type assertion to help TypeScript
    const deletedProduct = await (ProductModel as any).findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: id
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}