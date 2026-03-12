import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking, Customer, Employee } from '@/lib/models'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const trackingCode = searchParams.get('trackingCode')
  
  // Requirement: If not searching by trackingCode, require authentication
  if (!trackingCode) {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    await connectToDatabase()
    
    // Build query
    const query: any = {}
    if (status) query.status = status
    if (trackingCode) query.trackingCode = trackingCode

    let bookings = await Booking.find(query)
      .populate('customerId')
      .populate('serviceId')
      .populate('employeeId')
      .sort({ createdAt: -1 })
      
    // Self-heal: Generate and save tracking codes for legacy bookings that don't have one
    let migrated = false
    for (const booking of bookings) {
      if (!booking.trackingCode) {
        booking.trackingCode = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        await booking.save()
        migrated = true
      }
    }
    
    // Re-fetch if we migrated any, to get populated properly or just return them as they are updated in memory.
    // Actually, saving them updates them in memory, so we can just return down below.
    
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    // Generate tracking code: BK- followed by 6 random alphanumeric characters
    const trackingCode = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    // Create booking
    if (body.employeeId) {
      const emp = await Employee.findById(body.employeeId)
      if (!emp || !emp.isAvailable) {
        return NextResponse.json({ error: 'Selected employee is not available' }, { status: 400 })
      }
    }

    const booking = new Booking({
      customerId: body.customerId,
      serviceId: body.serviceId,
      employeeId: body.employeeId || undefined,
      trackingCode,
      date: new Date(body.scheduledDate),
      time: new Date(body.scheduledDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      notes: body.notes || '',
      formData: {
        address: body.address,
        ...(body.formData || {})
      }
    })
    
    await booking.save()
    
    // Update customer history
    await Customer.findByIdAndUpdate(body.customerId, {
      $push: { bookingHistory: booking._id }
    })
    
    const populatedBooking = (await Booking.findById(booking._id)
      .populate('customerId')
      .populate('serviceId')
      .lean()) as any
    
    if (populatedBooking) {
      populatedBooking.trackingCode = trackingCode
    }
    
    return NextResponse.json(populatedBooking, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking details:', error)
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}
