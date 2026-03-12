import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Service } from '@/lib/models'
import { Types } from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    
    const activeParam = searchParams.get('active')
    const query = activeParam === 'false' ? {} : { isActive: true }
    const services = await Service.find(query).sort({ order: 1, createdAt: -1 }).lean()
    
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error: any) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services', message: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const { services } = body

    if (!Array.isArray(services)) {
      return NextResponse.json({ error: 'Invalid services data' }, { status: 400 })
    }

    // Bulk update order for all services
    const bulkOps = services.map((service: { _id: string; order: number }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(service._id) },
        update: { $set: { order: service.order } },
      },
    }))

    const result = await Service.bulkWrite(bulkOps)
    console.log('Bulk reorder success. Modified:', result.modifiedCount)
    
    return NextResponse.json({ 
        message: 'Reordered successfully', 
        stats: { matched: result.matchedCount, modified: result.modifiedCount } 
    })
  } catch (error: any) {
    console.error('Error reordering services:', error)
    return NextResponse.json({ error: 'Failed to reorder services', message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    // Get max order to put at the end
    const lastService = await Service.findOne().sort({ order: -1 })
    const nextOrder = lastService ? (lastService.order || 0) + 1 : 0
    
    const service = new Service({
        ...body,
        order: body.order ?? nextOrder
    })
    await service.save()
    
    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
