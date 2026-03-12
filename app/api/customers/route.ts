import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { Customer } from '@/lib/models'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const customers = await Customer.find().sort({ createdAt: -1 })
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    // Check if customer already exists by phone (since email is optional)
    let customer = null
    
    if (body.phone) {
      customer = await Customer.findOne({ phone: body.phone })
    }
    
    if (customer) {
      // Update existing customer info
      customer.name = body.name || customer.name
      customer.email = body.email || customer.email
      customer.address = body.address || customer.address
      await customer.save()
      return NextResponse.json(customer, { status: 200 })
    }

    // Create new customer
    customer = new Customer({
      name: body.name,
      phone: body.phone,
      email: body.email || '',
      address: body.address || '',
    })
    await customer.save()
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Error in customer POST:', error)
    return NextResponse.json({ error: error.message || 'Failed to process customer' }, { status: 500 })
  }
}
