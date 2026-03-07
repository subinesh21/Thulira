import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

// POST - Create new product (Admin only)
export async function POST(request: NextRequest) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    await connectDB();

    const body = await request.json();
    const product = new Product(body);
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create product' },
      { status: 500 }
    );
  }
}