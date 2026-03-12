import mongoose, { Schema, Document, Types } from 'mongoose'

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'

export interface IBooking extends Document {
  customerId: Types.ObjectId
  serviceId: Types.ObjectId
  employeeId?: Types.ObjectId
  trackingCode: string
  date: Date
  time: string
  status: BookingStatus
  formData: Record<string, unknown>
  notes: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    trackingCode: { type: String, immutable: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    formData: { type: Schema.Types.Mixed, default: {} },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
