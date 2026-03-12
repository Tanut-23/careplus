import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Booking } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const booking = await Booking.findById(id)
      .populate('customerId')
      .populate('serviceId')
      .populate('employeeId')
    
    if (booking && !booking.trackingCode) {
      booking.trackingCode = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      await booking.save()
    }
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const body = await request.json()
    
    // Prevent trackingCode from being updated
    if (body.trackingCode) {
      delete body.trackingCode
    }
    
    const booking = await Booking.findByIdAndUpdate(id, body, { new: true })
      .populate('customerId')
      .populate('serviceId')
      .populate('employeeId')
    
    if (booking && !booking.trackingCode) {
      booking.trackingCode = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      await booking.save()
    }
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const booking = await Booking.findByIdAndDelete(id)
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Booking deleted' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
