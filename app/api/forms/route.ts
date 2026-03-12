import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Form } from '@/lib/models'

export async function GET() {
  try {
    await connectToDatabase()
    const forms = await Form.find().sort({ createdAt: -1 })
    
    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    const form = new Form(body)
    await form.save()
    
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
