import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  test('GET /api/services returns array', async ({ request }) => {
    const res = await request.get('/api/services')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('GET /api/employees returns array', async ({ request }) => {
    const res = await request.get('/api/employees')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('GET /api/employees?available=true returns only available', async ({ request }) => {
    const res = await request.get('/api/employees?available=true')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    data.forEach((e: any) => expect(e.isAvailable).toBe(true))
  })

  test('GET /api/reviews returns array', async ({ request }) => {
    const res = await request.get('/api/reviews')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('GET /api/bookings/count returns total number', async ({ request }) => {
    const res = await request.get('/api/bookings/count')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(typeof data.total).toBe('number')
    expect(data.total).toBeGreaterThanOrEqual(0)
  })

  test('POST /api/reviews creates a review', async ({ request }) => {
    const res = await request.post('/api/reviews', {
      data: {
        customerName: 'API Test User',
        rating: 5,
        comment: 'Automated API test review',
      },
    })
    expect(res.status()).toBe(201)
    const data = await res.json()
    expect(data.customerName).toBe('API Test User')
    expect(data.rating).toBe(5)
  })

  test('POST /api/reviews rejects missing rating', async ({ request }) => {
    const res = await request.post('/api/reviews', {
      data: { customerName: 'No Rating User', comment: 'test' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('POST /api/employees creates employee', async ({ request }) => {
    const res = await request.post('/api/employees', {
      data: {
        name: 'API Employee',
        email: `apitest_${Date.now()}@test.com`,
        phone: '0891234567',
        role: 'ผู้ดูแล',
        isAvailable: true,
      },
    })
    expect(res.status()).toBe(201)
    const data = await res.json()
    expect(data.name).toBe('API Employee')
  })

  test('DELETE /api/employees/:id deletes employee', async ({ request }) => {
    // Create first
    const create = await request.post('/api/employees', {
      data: {
        name: 'Delete Me',
        email: `delete_${Date.now()}@test.com`,
        phone: '0891234567',
        role: 'ผู้ดูแล',
      },
    })
    const emp = await create.json()

    const del = await request.delete(`/api/employees/${emp._id}`)
    expect(del.status()).toBe(200)
  })

  test('POST /api/bookings creates booking and returns tracking code', async ({ request }) => {
    // Create customer first
    const custRes = await request.post('/api/customers', {
      data: { name: 'API Customer', phone: '0891234567' },
    })
    const cust = await custRes.json()

    // Get a service
    const svcRes = await request.get('/api/services')
    const services = await svcRes.json()
    if (!services.length) return // skip if no services

    const bookRes = await request.post('/api/bookings', {
      data: {
        customerId: cust._id,
        serviceId: services[0]._id,
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        address: '123 Test Address',
      },
    })
    expect(bookRes.status()).toBe(201)
    const booking = await bookRes.json()
    expect(booking.trackingCode).toMatch(/^BK-[A-Z0-9]{6}$/)
  })
})
