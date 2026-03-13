import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  customerName: string
  rating: number
  comment: string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
