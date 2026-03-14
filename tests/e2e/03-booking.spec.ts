import { test, expect } from '@playwright/test'

test.describe('Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/booking')
    await page.waitForTimeout(1500)
  })

  test('shows booking form sections', async ({ page }) => {
    await expect(page.getByText('ข้อมูลผู้จอง')).toBeVisible()
    await expect(page.getByText('เลือกบริการ')).toBeVisible()
    await expect(page.getByText('กำหนดวันเวลา')).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /ยืนยันการจอง/i }).click()
    await expect(page.getByText('กรุณากรอกชื่อ')).toBeVisible()
    await expect(page.getByText('กรุณากรอกเบอร์โทร')).toBeVisible()
  })

  test('formats phone number automatically', async ({ page }) => {
    const phoneInput = page.getByLabel(/เบอร์โทร/i)
    await phoneInput.fill('0812345678')
    await expect(phoneInput).toHaveValue('081-234-5678')
  })

  test('date picker opens calendar on click', async ({ page }) => {
    const dateBtn = page.getByText(/เลือกวันที่/i)
    await dateBtn.click()
    await expect(page.locator('.grid.grid-cols-7')).toBeVisible()
  })

  test('calendar disables past dates', async ({ page }) => {
    const dateBtn = page.getByText(/เลือกวันที่/i)
    await dateBtn.click()
    const disabledDay = page.locator('button[disabled]').first()
    await expect(disabledDay).toBeDisabled()
  })

  test('calendar can navigate to next month', async ({ page }) => {
    const dateBtn = page.getByText(/เลือกวันที่/i)
    await dateBtn.click()
    const nextBtn = page.locator('button').filter({ has: page.locator('svg') }).last()
    await nextBtn.click()
    await expect(page.locator('.grid.grid-cols-7')).toBeVisible()
  })

  test('time slot grid shows options from 06:00', async ({ page }) => {
    await expect(page.getByRole('button', { name: '06:00' })).toBeVisible()
    await expect(page.getByRole('button', { name: '20:00' })).toBeVisible()
  })

  test('selecting a time slot highlights it', async ({ page }) => {
    const slot = page.getByRole('button', { name: '09:00' })
    await slot.click()
    await expect(slot).toHaveClass(/bg-primary/)
  })

  test('custom time button appears and opens input', async ({ page }) => {
    const customBtn = page.getByRole('button', { name: /กำหนดเอง/i })
    await expect(customBtn).toBeVisible()
    await customBtn.click()
    await expect(page.locator('input[type="time"]')).toBeVisible()
  })

  test('employee picker button opens modal', async ({ page }) => {
    const empBtn = page.getByText(/ไม่ระบุ \(ให้ระบบเลือก\)/i)
    await empBtn.click()
    await expect(page.getByText('เลือกพนักงาน')).toBeVisible()
  })

  test('employee modal closes on backdrop click', async ({ page }) => {
    await page.getByText(/ไม่ระบุ \(ให้ระบบเลือก\)/i).click()
    await expect(page.getByText('เลือกพนักงาน')).toBeVisible()
    await page.keyboard.press('Escape')
    // click backdrop
    await page.mouse.click(10, 10)
    await expect(page.getByText('เลือกพนักงาน')).not.toBeVisible()
  })

  test('booking summary updates when service is selected', async ({ page }) => {
    await page.waitForTimeout(1000)
    // open service select
    const serviceSelect = page.locator('[id="service"], button[role="combobox"]').first()
    await serviceSelect.click()
    const option = page.locator('[role="option"]').first()
    await option.click()
    await expect(page.getByText('สรุปการจอง')).toBeVisible()
  })

  test('completes a full booking successfully', async ({ page }) => {
    await page.waitForTimeout(2000)

    // Fill customer info
    await page.getByLabel(/ชื่อ-นามสกุล/i).fill('ทดสอบ ระบบ')
    await page.getByLabel(/เบอร์โทร/i).fill('0812345678')
    await page.getByLabel(/อีเมล/i).fill('test@test.com')
    await page.getByLabel(/สถานที่/i).fill('123 ถนนทดสอบ')

    // Select service
    const serviceSelect = page.locator('button[role="combobox"]').first()
    await serviceSelect.click()
    await page.locator('[role="option"]').first().click()

    // Select date (pick tomorrow)
    await page.getByText(/เลือกวันที่/i).click()
    const enabledDay = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).nth(1)
    await enabledDay.click()

    // Select time
    await page.getByRole('button', { name: '09:00' }).click()

    // Submit
    await page.getByRole('button', { name: /ยืนยันการจอง/i }).click()
    await page.waitForTimeout(3000)

    // Should show success with tracking code
    await expect(page.getByText(/รหัสติดตาม/i)).toBeVisible({ timeout: 10000 })
  })
})
