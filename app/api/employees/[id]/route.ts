import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Employee } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const employee = await Employee.findById(id)
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
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
    
    const employee = await Employee.findByIdAndUpdate(id, body, { new: true })
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const employee = await Employee.findByIdAndDelete(id)
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Employee deleted' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
