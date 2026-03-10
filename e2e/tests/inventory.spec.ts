import { test, expect, type Page } from '@playwright/test'

async function mockApis(page: Page) {
  await page.route('**/api/fooditems**', route =>
    route.fulfill({ json: [] })
  )
  await page.route('**/api/reports/dashboard', route =>
    route.fulfill({ json: { totalActiveItems: 0, expiredCount: 0, urgentCount: 0, safeCount: 0, atRiskValue: 0, expiredValue: 0, daysWithoutWaste: 0, weeklySavings: 0 } })
  )
}

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page)
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
  })

  test('shows Inventory heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible()
  })

  test('shows Add Item button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Item/ })).toBeVisible()
  })

  test('shows quick-add preset chips', async ({ page }) => {
    await expect(page.getByText('Quick add:')).toBeVisible()
    await expect(page.getByRole('button', { name: /Milk/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Eggs/ })).toBeVisible()
  })

  test('shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search name or category\u2026')).toBeVisible()
  })

  test('shows empty detail pane with No item selected', async ({ page }) => {
    await expect(page.getByText('No item selected')).toBeVisible()
  })

  test('opens add form when clicking Add Item', async ({ page }) => {
    await page.getByRole('button', { name: /Add Item/ }).click()
    await expect(page.getByRole('heading', { name: 'Add Food Item' })).toBeVisible()
  })

  test('filters list on search input', async ({ page }) => {
    const search = page.getByPlaceholder('Search name or category\u2026')
    await search.fill('zzznomatch')
    await expect(page.locator('.item-row')).toHaveCount(0)
  })
})

test.describe('Inventory — navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page)
    // Also mock reports/recipes endpoints for navigation targets
    await page.route('**/api/reports/**', route => route.fulfill({ json: [] }))
    await page.route('**/api/recipes/**', route => route.fulfill({ json: { urgentIngredients: [], pantryStaples: [], searchQuery: '', searchUrl: '' } }))
    await page.route('**/api/pantrystaples**', route => route.fulfill({ json: [] }))
  })

  test('navigates to Reports from sidebar', async ({ page }) => {
    await page.goto('/inventory')
    await page.getByRole('link', { name: /Reports/ }).click()
    await expect(page.getByRole('heading', { name: 'Waste Accountant' })).toBeVisible()
  })

  test('navigates to Recipes from sidebar', async ({ page }) => {
    await page.goto('/inventory')
    await page.getByRole('link', { name: /Recipes/ }).click()
    await expect(page.getByRole('heading', { name: 'Recipe Engine' })).toBeVisible()
  })
})
