import mongoose, { Schema, Document } from 'mongoose'

export interface IFormField {
  name: string
  label: { th: string; en: string }
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: { th: string; en: string }[]
  required: boolean
}

export interface IForm extends Document {
  name: { th: string; en: string }
  fields: IFormField[]
  createdAt: Date
  updatedAt: Date
}

const FormFieldSchema = new Schema<IFormField>(
  {
    name: { type: String, required: true },
    label: {
      th: { type: String, required: true },
      en: { type: String, required: true },
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea'],
      default: 'text',
    },
    options: [
      {
        th: { type: String },
        en: { type: String },
      },
    ],
    required: { type: Boolean, default: false },
  },
  { _id: false }
)

const FormSchema = new Schema<IForm>(
  {
    name: {
      th: { type: String, required: true },
      en: { type: String, required: true },
    },
    fields: [FormFieldSchema],
  },
  { timestamps: true }
)

export const Form = mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema)
