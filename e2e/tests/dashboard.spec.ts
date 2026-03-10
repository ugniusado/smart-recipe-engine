import { test, expect, type Page } from '@playwright/test'

const DASHBOARD_SUMMARY = {
  totalActiveItems: 5,
  expiredCount: 1,
  urgentCount: 2,
  safeCount: 2,
  atRiskValue: 13.48,
  expiredValue: 3.49,
  daysWithoutWaste: 3,
  weeklySavings: 6.47,
}

async function mockApis(page: Page) {
  await page.route('**/api/reports/dashboard', route =>
    route.fulfill({ json: DASHBOARD_SUMMARY })
  )
  await page.route('**/api/fooditems**', route =>
    route.fulfill({ json: [] })
  )
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('loads with correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Smart Fridge/)
  })

  test('shows Mission Control heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible()
  })

  test('shows KPI cards', async ({ page }) => {
    await expect(page.getByText('Active Items')).toBeVisible()
    await expect(page.getByText('Urgent (0-2d)')).toBeVisible()
    await expect(page.getByText('Safe Items')).toBeVisible()
    await expect(page.getByText('Weekly Savings')).toBeVisible()
  })

  test('shows Expiry Heatmap section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Expiry Heatmap' })).toBeVisible()
  })

  test('shows navigation sidebar links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Inventory/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Reports/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Recipes/ })).toBeVisible()
  })
})
