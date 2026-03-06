import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ReviewModel from '@/models/Review';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';

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

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const reviews = await ReviewModel.find({ productId })
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

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Create review
        const review = await ReviewModel.create({
            productId,
            reviewerName: reviewerName.trim(),
            rating: Number(rating),
            comment: comment.trim()
        });

        // Update product's review count and average rating
        const allReviews = await ReviewModel.find({ productId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;

        await ProductModel.findByIdAndUpdate(productId, {
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
