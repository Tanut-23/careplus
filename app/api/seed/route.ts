import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { Admin, Service } from '@/lib/models'

export async function POST() {
  try {
    await connectToDatabase()
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' })
    
    if (!existingAdmin) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await Admin.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'superadmin',
      })
    }
    
    // Create sample services if none exist
    const existingServices = await Service.countDocuments()
    
    if (existingServices === 0) {
      await Service.insertMany([
        {
          name: { th: 'บริการดูแลผู้สูงอายุรายวัน', en: 'Daily Elderly Care' },
          description: {
            th: 'บริการดูแลผู้สูงอายุตลอดทั้งวัน ครอบคลุมการดูแลสุขภาพ อาหาร และกิจกรรมต่างๆ',
            en: 'Full day elderly care service covering health care, meals, and activities',
          },
          price: 2500,
          duration: '8 ชั่วโมง',
          category: 'daily',
          isActive: true,
        },
        {
          name: { th: 'บริการพยาบาลที่บ้าน', en: 'Home Nursing Service' },
          description: {
            th: 'พยาบาลวิชาชีพไปดูแลสุขภาพที่บ้าน ฉีดยา วัดความดัน ดูแลแผล',
            en: 'Professional nurses visit to provide health care at home',
          },
          price: 1500,
          duration: '2 ชั่วโมง',
          category: 'medical',
          isActive: true,
        },
        {
          name: { th: 'กายภาพบำบัดที่บ้าน', en: 'Home Physiotherapy' },
          description: {
            th: 'นักกายภาพบำบัดไปให้บริการฟื้นฟูสมรรถภาพร่างกายที่บ้าน',
            en: 'Physiotherapist provides rehabilitation services at home',
          },
          price: 2000,
          duration: '1 ชั่วโมง',
          category: 'physical',
          isActive: true,
        },
        {
          name: { th: 'บริการดูแลผู้สูงอายุรายเดือน', en: 'Monthly Elderly Care' },
          description: {
            th: 'บริการดูแลผู้สูงอายุแบบรายเดือน มีผู้ดูแลประจำคอยดูแลตลอด',
            en: 'Monthly elderly care service with dedicated caregiver',
          },
          price: 35000,
          duration: '1 เดือน',
          category: 'daily',
          isActive: true,
        },
      ])
    }
    
    return NextResponse.json({ message: 'Seed completed successfully' })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
