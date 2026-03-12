import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Service, Booking } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const service = await Service.findById(id)
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
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
    
    const service = await Service.findByIdAndUpdate(id, body, { new: true })
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params

    // Check if the service is used in any active bookings
    const activeBooking = await Booking.findOne({
      serviceId: id,
      status: { $nin: ['completed', 'cancelled'] }
    })

    if (activeBooking) {
      return NextResponse.json(
        { 
          error: 'Cannot delete service that is in an active booking',
          errorTh: 'ไม่สามารถลบบริการได้เนื่องจากมีการจองที่ยังไม่เสร็จสิ้น'
        }, 
        { status: 400 }
      )
    }

    const service = await Service.findByIdAndDelete(id)
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Service deleted' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
