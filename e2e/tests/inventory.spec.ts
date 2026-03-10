import { test, expect } from '@playwright/test'

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
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
    // placeholder uses an ellipsis character (…)
    await expect(page.getByPlaceholder('Search name or category\u2026')).toBeVisible()
  })

  test('shows empty detail pane with No item selected', async ({ page }) => {
    await expect(page.getByText('No item selected')).toBeVisible()
  })

  test('opens add form when clicking Add Item', async ({ page }) => {
    await page.getByRole('button', { name: /Add Item/ }).click()
    // Form heading for new items is "Add Food Item"
    await expect(page.getByRole('heading', { name: 'Add Food Item' })).toBeVisible()
  })

  test('filters list on search input', async ({ page }) => {
    const search = page.getByPlaceholder('Search name or category\u2026')
    await search.fill('zzznomatch')
    const rows = page.locator('.item-row')
    await expect(rows).toHaveCount(0)
  })
})

test.describe('Inventory — navigation', () => {
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
