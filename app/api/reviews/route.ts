import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ReviewModel from '@/models/Review';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';
import { PRODUCTS } from '@/lib/product-data';

// Helper to find a product's ObjectId based on either static mapping or Mongo search
async function ensureProductMongoId(passedId: string) {
    if (mongoose.Types.ObjectId.isValid(passedId)) {
        return passedId;
    }

    const numericId = parseInt(passedId);
    if (!isNaN(numericId)) {
        const staticProd = PRODUCTS.find((p) => p.id === numericId || p._id === passedId);

        let prod = await ProductModel.findOne({ id: numericId });

        if (!prod && staticProd) {
            prod = await ProductModel.findOne({ name: staticProd.name });
            if (prod) {
                prod.id = numericId;
                await prod.save();
            }
        }

        if (prod) {
            return prod._id.toString();
        } else {
            // Find static product to use its details
            const staticProd = PRODUCTS.find((p) => p.id === numericId || p._id === passedId);
            if (staticProd) {
                // If it doesn't exist in MongoDB yet, we must create a stub to attach reviews to,
                // or just attach the review directly to the string ID.
                // It's safer to create a stub in Mongo so the Review model's ObjectId ref works.
                const { _id, ...staticProdWithoutId } = staticProd as any;

                // If it's not a valid internal ObjectID yet, DO NOT spread `_id`. 
                // Let mongoose auto-generate a valid 24-char hex string as the ObjectId.
                // Just map the static ID to the `id` field.

                const newProd = await ProductModel.create({
                    ...staticProdWithoutId,
                    id: staticProd.id || parseInt(staticProd._id),
                    isActive: (staticProd as any).isActive ?? true,
                    inStock: staticProd.inStock ?? true,
                });
                return newProd._id.toString();
            }
        }
    }
    return null;
}

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'productId is required' },
                { status: 400 }
            );
        }

        // Try to find the mapped MongoDB ID first
        let mongoId = productId;
        let isValidObjectId = mongoose.Types.ObjectId.isValid(productId);

        const numericId = parseInt(productId);
        if (!isValidObjectId && !isNaN(numericId)) {
            let prod = await ProductModel.findOne({ id: numericId });

            if (!prod) {
                const staticProd = PRODUCTS.find((p) => p.id === numericId || p._id === productId);
                if (staticProd) {
                    prod = await ProductModel.findOne({ name: staticProd.name });
                    if (prod) {
                        prod.id = numericId;
                        await prod.save();
                    }
                }
            }

            if (prod) {
                mongoId = prod._id.toString();
                isValidObjectId = true;
            }
        }

        // If mongoId is still not a valid ObjectId, it means the product doesn't exist in MongoDB yet
        // Therefore, it has no reviews.
        if (!isValidObjectId) {
            return NextResponse.json({
                success: true,
                reviews: [],
                count: 0,
                averageRating: 0
            });
        }

        const reviews = await ReviewModel.find({ productId: mongoId })
            .sort({ createdAt: -1 })
            .lean();

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0;

        return NextResponse.json({
            success: true,
            reviews,
            count: reviews.length,
            averageRating
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { productId, reviewerName, rating, comment } = body;

        // Validation
        if (!productId || !reviewerName || !rating || !comment) {
            return NextResponse.json(
                { success: false, message: 'All fields are required: productId, reviewerName, rating, comment' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const resolvedProductId = await ensureProductMongoId(productId);
        if (!resolvedProductId) {
            return NextResponse.json(
                { success: false, message: 'Product not found globally' },
                { status: 404 }
            );
        }

        // Create review
        const review = await ReviewModel.create({
            productId: resolvedProductId,
            reviewerName: reviewerName.trim(),
            rating: Number(rating),
            comment: comment.trim()
        });

        // Update product's review count and average rating
        const allReviews = await ReviewModel.find({ productId: resolvedProductId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        await ProductModel.findByIdAndUpdate(resolvedProductId, {
            reviews: allReviews.length,
            rating: Math.round(avgRating * 10) / 10
        });

        return NextResponse.json({
            success: true,
            review,
            message: 'Review submitted successfully!'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to submit review' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get('reviewId');

        if (!reviewId) {
            return NextResponse.json(
                { success: false, message: 'reviewId is required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid review ID' },
                { status: 400 }
            );
        }

        // Find the review first to get the productId
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { success: false, message: 'Review not found' },
                { status: 404 }
            );
        }

        const productId = review.productId;

        // Delete the review
        await ReviewModel.findByIdAndDelete(reviewId);

        // Recalculate product rating
        const remainingReviews = await ReviewModel.find({ productId });
        const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = remainingReviews.length > 0 ? totalRating / remainingReviews.length : 0;

        await ProductModel.findByIdAndUpdate(productId, {
            reviews: remainingReviews.length,
            rating: Math.round(avgRating * 10) / 10
        });

        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete review' },
            { status: 500 }
        );
    }
}
