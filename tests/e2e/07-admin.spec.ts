import { test, expect, Page } from '@playwright/test'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@careplus.com'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'

async function loginAsAdmin(page: Page) {
  await page.goto('/th/admin/login')
  await page.getByLabel(/อีเมล|email/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/รหัสผ่าน|password/i).fill(ADMIN_PASS)
  await page.getByRole('button', { name: /เข้าสู่ระบบ|login/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 })
}

test.describe('Admin Login', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/th/admin/login')
    await expect(page.getByLabel(/อีเมล|email/i)).toBeVisible()
    await expect(page.getByLabel(/รหัสผ่าน|password/i)).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/th/admin/login')
    await page.getByLabel(/อีเมล|email/i).fill('wrong@email.com')
    await page.getByLabel(/รหัสผ่าน|password/i).fill('wrongpass')
    await page.getByRole('button', { name: /เข้าสู่ระบบ|login/i }).click()
    await expect(page.getByText(/ไม่ถูกต้อง|invalid|error/i)).toBeVisible({ timeout: 5000 })
  })

  test('redirects unauthenticated users away from admin', async ({ page }) => {
    await page.goto('/th/admin')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('shows dashboard stats', async ({ page }) => {
    await page.goto('/th/admin')
    await page.waitForTimeout(2000)
    await expect(page.getByText(/การจอง|booking/i).first()).toBeVisible()
  })

  test('sidebar navigation links work', async ({ page }) => {
    const links = ['employees', 'services', 'bookings', 'customers', 'reviews']
    for (const link of links) {
      await page.goto(`/th/admin/${link}`)
      await expect(page).toHaveURL(new RegExp(link))
    }
  })
})

test.describe('Admin Employees', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/employees')
    await page.waitForTimeout(1500)
  })

  test('shows employee list', async ({ page }) => {
    await expect(page.getByText(/พนักงาน/i).first()).toBeVisible()
  })

  test('opens add employee dialog', async ({ page }) => {
    await page.getByRole('button', { name: /เพิ่ม/i }).click()
    await expect(page.getByText(/เพิ่ม พนักงาน/i)).toBeVisible()
  })

  test('shows validation error on empty employee form', async ({ page }) => {
    await page.getByRole('button', { name: /เพิ่ม/i }).click()
    await page.getByRole('button', { name: /บันทึก/i }).click()
    await expect(page.getByText(/กรุณา/i).first()).toBeVisible()
  })

  test('creates a new employee', async ({ page }) => {
    await page.getByRole('button', { name: /เพิ่ม/i }).click()

    await page.getByLabel(/ชื่อ-นามสกุล/i).fill('พนักงานทดสอบ')
    await page.getByLabel(/อีเมล/i).fill(`test_${Date.now()}@careplus.com`)
    await page.getByLabel(/เบอร์โทร/i).fill('0891234567')
    await page.getByLabel(/ตำแหน่ง/i).fill('ผู้ดูแล')

    await page.getByRole('button', { name: /บันทึก/i }).click()
    await page.waitForTimeout(2000)

    await expect(page.getByText('พนักงานทดสอบ')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Admin Services', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/services')
    await page.waitForTimeout(1500)
  })

  test('shows services list', async ({ page }) => {
    await expect(page.getByText(/บริการ/i).first()).toBeVisible()
  })

  test('opens add service dialog', async ({ page }) => {
    await page.getByRole('button', { name: /เพิ่ม/i }).click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})

test.describe('Admin Bookings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/bookings')
    await page.waitForTimeout(1500)
  })

  test('shows bookings table', async ({ page }) => {
    await expect(page.getByText(/การจอง/i).first()).toBeVisible()
  })

  test('status filter buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ทั้งหมด|all/i })).toBeVisible()
  })
})

test.describe('Admin Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/reviews')
    await page.waitForTimeout(1500)
  })

  test('shows reviews page', async ({ page }) => {
    await expect(page.getByText(/รีวิว/i).first()).toBeVisible()
  })
})

test.describe('Admin Customers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/customers')
    await page.waitForTimeout(1500)
  })

  test('shows customers list', async ({ page }) => {
    await expect(page.getByText(/ลูกค้า/i).first()).toBeVisible()
  })
})

test.describe('Admin Translations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/th/admin/translations')
    await page.waitForTimeout(1500)
  })

  test('shows translations page with search', async ({ page }) => {
    await expect(page.getByPlaceholder(/ค้นหา|search/i)).toBeVisible()
  })
})
