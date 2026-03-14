import { test, expect } from '@playwright/test'

test.describe('Booking Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/tracking')
  })

  test('shows tracking input form', async ({ page }) => {
    await expect(page.getByPlaceholder(/BK-/i)).toBeVisible()
  })

  test('shows error for invalid tracking code', async ({ page }) => {
    const input = page.getByPlaceholder(/BK-/i)
    await input.fill('BK-INVALID')
    await page.getByRole('button', { name: /ค้นหา|ติดตาม/i }).click()
    await page.waitForTimeout(2000)
    await expect(page.getByText(/ไม่พบ|not found/i)).toBeVisible()
  })

  test('shows error for empty search', async ({ page }) => {
    await page.getByRole('button', { name: /ค้นหา|ติดตาม/i }).click()
    await expect(page.getByText(/กรุณา|required/i)).toBeVisible()
  })
})
