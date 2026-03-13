import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Review } from '@/lib/models'
import { auth } from '@/lib/auth'

// PUT - toggle visibility (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectToDatabase()
    const { id } = await params
    const body = await req.json()

    const review = await Review.findByIdAndUpdate(id, body, { new: true })
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE - admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectToDatabase()
    const { id } = await params
    const review = await Review.findByIdAndDelete(id)
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
