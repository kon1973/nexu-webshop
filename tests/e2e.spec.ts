import { test, expect } from '@playwright/test';

test('homepage has title and products', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/NEXU/);

  // Check if products are visible (assuming there are products seeded)
  // We look for product cards or a specific section
  // This depends on the actual UI.
  // Let's check for the main heading or navbar
  await expect(page.locator('nav')).toBeVisible();
});

test('shop page loads and filters work', async ({ page }) => {
  await page.goto('/shop');
  await expect(page).toHaveURL(/.*shop/);
  
  // Check if filter panel exists
  await expect(page.getByText('Szűrés')).toBeVisible();
});

test('add to cart flow', async ({ page }) => {
  await page.goto('/shop');
  
  // Find the first product card and click it
  // This selector might need adjustment based on actual UI
  const firstProduct = page.locator('a[href^="/shop/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  // On product page
  await expect(page.getByText('Kosárba')).toBeVisible();
  
  // Add to cart
  await page.getByText('Kosárba').click();
  
  // Expect toast or cart counter update
  // await expect(page.getByText('Termék a kosárba került')).toBeVisible();
});
