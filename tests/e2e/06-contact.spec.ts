import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/contact')
  })

  test('shows contact form', async ({ page }) => {
    await expect(page.getByText(/ติดต่อ/i).first()).toBeVisible()
  })

  test('shows contact information', async ({ page }) => {
    // Phone, email, or address should be visible
    const contactInfo = page.locator('[class*="contact"], section, main')
    await expect(contactInfo.first()).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /ส่ง|submit/i })
    await submitBtn.click()
    await expect(page.getByText(/กรุณา/i).first()).toBeVisible()
  })
})
