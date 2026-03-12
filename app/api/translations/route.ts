import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Translation } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    const query = section ? { section } : {}
    const translations = await Translation.find(query).sort({ key: 1 })
    
    return NextResponse.json(translations)
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    const translation = new Translation(body)
    await translation.save()
    
    return NextResponse.json(translation, { status: 201 })
  } catch (error) {
    console.error('Error creating translation:', error)
    return NextResponse.json({ error: 'Failed to create translation' }, { status: 500 })
  }
}
