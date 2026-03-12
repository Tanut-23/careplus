import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking, Customer, Employee, Service } from '@/lib/models'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalCustomers,
      totalEmployees,
      totalServices,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Customer.countDocuments(),
      Employee.countDocuments(),
      Service.countDocuments({ isActive: true }),
    ])
    
    return NextResponse.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalCustomers,
      totalEmployees,
      totalServices,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
