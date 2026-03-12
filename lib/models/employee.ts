import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IEmployee extends Document {
  name: string
  email: string
  phone: string
  role: string
  isAvailable: boolean
  assignedBookings: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    assignedBookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
)

export const Employee = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema)
