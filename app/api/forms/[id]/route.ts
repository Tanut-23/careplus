import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Form } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const form = await Form.findById(id)
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
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
    
    const form = await Form.findByIdAndUpdate(id, body, { new: true })
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    return NextResponse.json(form)
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const form = await Form.findByIdAndDelete(id)
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Form deleted' })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
