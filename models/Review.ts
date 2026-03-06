import mongoose, { Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
    productId: Types.ObjectId;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    reviewerName: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fetching reviews by product
reviewSchema.index({ productId: 1, createdAt: -1 });

const ReviewModel = mongoose.models.Review as Model<IReview> || mongoose.model<IReview>('Review', reviewSchema);

export default ReviewModel;
