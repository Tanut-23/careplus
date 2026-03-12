import mongoose, { Schema, Document } from 'mongoose'

export interface ITranslation extends Document {
  key: string
  th: string
  en: string
  section: string
  updatedAt: Date
}

const TranslationSchema = new Schema<ITranslation>(
  {
    key: { type: String, required: true, unique: true },
    th: { type: String, required: true },
    en: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
)

export const Translation = mongoose.models.Translation || mongoose.model<ITranslation>('Translation', TranslationSchema)
