import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking } from '@/lib/models'

export async function GET() {
  try {
    await connectToDatabase()
    const total = await Booking.countDocuments()
    return NextResponse.json({ total })
  } catch (error) {
    console.error('Error fetching booking count:', error)
    return NextResponse.json({ total: 0 }, { status: 500 })
  }
}
