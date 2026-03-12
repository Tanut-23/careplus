import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICustomer extends Document {
  name: string
  email: string
  phone: string
  address: string
  bookingHistory: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    bookingHistory: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
)

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema)
