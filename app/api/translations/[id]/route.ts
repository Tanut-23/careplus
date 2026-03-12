import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Translation } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const translation = await Translation.findById(id)
    
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }
    
    return NextResponse.json(translation)
  } catch (error) {
    console.error('Error fetching translation:', error)
    return NextResponse.json({ error: 'Failed to fetch translation' }, { status: 500 })
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
    
    const translation = await Translation.findByIdAndUpdate(id, body, { new: true })
    
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }
    
    return NextResponse.json(translation)
  } catch (error) {
    console.error('Error updating translation:', error)
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const translation = await Translation.findByIdAndDelete(id)
    
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Translation deleted' })
  } catch (error) {
    console.error('Error deleting translation:', error)
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 })
  }
}
