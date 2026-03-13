import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Review } from '@/lib/models'
import { auth } from '@/lib/auth'

// GET - public: visible reviews only | admin: all reviews
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const session = await auth()
    const all = req.nextUrl.searchParams.get('all')

    const filter = session && all === 'true' ? {} : { isVisible: true }
    const reviews = await Review.find(filter).sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST - create review (public)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { customerName, rating, comment } = body

    if (!customerName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await Review.create({ customerName, rating, comment, isVisible: true })
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
