import mongoose, { Schema, Document } from 'mongoose'

export interface IAdmin extends Document {
  email: string
  password: string
  name: string
  role: 'admin' | 'superadmin'
  createdAt: Date
  updatedAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  },
  { timestamps: true }
)

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema)
