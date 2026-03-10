import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Smart Fridge/)
  })

  test('shows Mission Control heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible()
  })

  test('shows all four KPI cards', async ({ page }) => {
    await expect(page.getByText('ACTIVE ITEMS')).toBeVisible()
    await expect(page.getByText('URGENT (0-2D)')).toBeVisible()
    await expect(page.getByText('EXPIRED')).toBeVisible()
    await expect(page.getByText('SAFE ITEMS')).toBeVisible()
  })

  test('shows Expiry Heatmap section', async ({ page }) => {
    await expect(page.getByText('Expiry Heatmap')).toBeVisible()
  })

  test('shows navigation sidebar links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Inventory/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Reports/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Recipes/ })).toBeVisible()
  })
})
