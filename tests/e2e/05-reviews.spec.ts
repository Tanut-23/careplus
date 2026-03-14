import { test, expect } from '@playwright/test'

test.describe('Reviews Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th/reviews')
  })

  test('shows review form', async ({ page }) => {
    await expect(page.getByText(/รีวิว|Review/i).first()).toBeVisible()
  })

  test('shows star rating selector', async ({ page }) => {
    // Stars should be clickable
    const stars = page.locator('[class*="star"], button svg, [aria-label*="star"]')
    const count = await stars.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('shows validation error when submitting empty form', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /ส่ง|submit/i })
    await submitBtn.click()
    await expect(page.getByText(/กรุณา/i).first()).toBeVisible()
  })

  test('submits review successfully', async ({ page }) => {
    // Fill name
    const nameInput = page.getByLabel(/ชื่อ/i).first()
    await nameInput.fill('ผู้ทดสอบ')

    // Click a star rating (4 stars)
    const starBtns = page.locator('button').filter({ has: page.locator('svg[class*="star"], [class*="Star"]') })
    const count = await starBtns.count()
    if (count >= 4) await starBtns.nth(3).click()
    else {
      // Try clicking by index in a star row
      const allStars = page.locator('[class*="cursor-pointer"]')
      await allStars.nth(3).click()
    }

    // Fill comment
    const commentArea = page.locator('textarea').first()
    await commentArea.fill('บริการดีมาก ทดสอบระบบอัตโนมัติ')

    const submitBtn = page.getByRole('button', { name: /ส่ง|submit/i })
    await submitBtn.click()
    await page.waitForTimeout(2000)

    await expect(page.getByText(/ขอบคุณ|success|สำเร็จ/i)).toBeVisible({ timeout: 8000 })
  })
})
