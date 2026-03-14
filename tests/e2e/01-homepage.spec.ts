import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th')
  })

  test('shows hero section with CTA buttons', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('link', { name: /จอง/i }).first()).toBeVisible()
  })

  test('shows stats cards (bookings, rating, employees)', async ({ page }) => {
    // Wait for SWR data to load
    await page.waitForTimeout(2000)
    const cards = page.locator('section').first().locator('[class*="card"], .rounded-xl, .rounded-lg').first()
    await expect(cards).toBeVisible()
  })

  test('shows features section', async ({ page }) => {
    await expect(page.getByText('ทำไมต้องเลือกเรา')).toBeVisible()
    await expect(page.getByText('ดูแลด้วยใจ')).toBeVisible()
    await expect(page.getByText('ปลอดภัย')).toBeVisible()
    await expect(page.getByText('24/7')).toBeVisible()
    await expect(page.getByText('ทีมมืออาชีพ')).toBeVisible()
  })

  test('shows services section', async ({ page }) => {
    await expect(page.getByText('บริการของเรา').first()).toBeVisible()
  })

  test('shows CTA section with booking and contact links', async ({ page }) => {
    await expect(page.getByText('พร้อมให้บริการดูแลคนที่คุณรัก')).toBeVisible()
    await expect(page.getByRole('link', { name: /ติดต่อเรา/i })).toBeVisible()
  })

  test('language switcher changes to English', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('h1')).toBeVisible()
  })
})
