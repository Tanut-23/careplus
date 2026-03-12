import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Employee } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')
    
    const query = available === 'true' ? { isAvailable: true } : {}
    const employees = await Employee.find(query).sort({ name: 1 })
    
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    
    const employee = new Employee(body)
    await employee.save()
    
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
