import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IService extends Document {
  name: { th: string; en: string }
  description: { th: string; en: string }
  price: number
  duration: string
  category: string
  image: string
  order: number
  isActive: boolean
  formId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      th: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      th: { type: String, required: true },
      en: { type: String, required: true },
    },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    category: { type: String, default: 'general' },
    order: { type: Number, default: 0 },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    formId: { type: Schema.Types.ObjectId, ref: 'Form' },
  },
  { timestamps: true }
)

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema)
