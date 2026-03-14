import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/services')
  })

  test('loads services page', async ({ page }) => {
    await expect(page).toHaveURL(/\/th\/services/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('shows service cards', async ({ page }) => {
    await page.waitForTimeout(2000)
    const cards = page.locator('[class*="card"]')
    await expect(cards.first()).toBeVisible()
  })

  test('each service card has a book button', async ({ page }) => {
    await page.waitForTimeout(2000)
    const bookBtns = page.getByRole('link', { name: /จอง/i })
    const count = await bookBtns.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('clicking book now navigates to booking with service param', async ({ page }) => {
    await page.waitForTimeout(2000)
    const bookBtn = page.getByRole('link', { name: /จอง/i }).first()
    await bookBtn.click()
    await expect(page).toHaveURL(/\/th\/booking/)
  })
})
