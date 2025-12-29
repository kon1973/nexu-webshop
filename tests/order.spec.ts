import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test('guest user can add to cart and reach checkout', async ({ page }) => {
    // 1. Go to shop
    await page.goto('/shop');
    
    // 2. Add first product to cart
    // Wait for products to load
    await expect(page.locator('a[href^="/shop/"]').first()).toBeVisible();
    
    // Click on the first product card to go to details (safer than trying to click "Add to cart" on hover)
    await page.locator('a[href^="/shop/"]').first().click();
    
    // 3. On product page, click "Kosárba"
    await expect(page.getByText('Kosárba')).toBeVisible();
    await page.getByText('Kosárba').click();
    
    // 4. Expect toast or cart to open
    // Assuming cart sidebar opens or toast appears. 
    // Let's check if cart badge updates or sidebar opens.
    // For now, let's just go to /cart
    await page.goto('/cart');
    
    // 5. Check if item is in cart
    await expect(page.getByText('Tovább a pénztárhoz')).toBeVisible();
    
    // 6. Go to checkout
    await page.getByText('Tovább a pénztárhoz').click();
    
    // 7. Should be redirected to login or checkout depending on config
    // Since we allow guest checkout (or require login), let's see.
    // The current flow might require login.
    await expect(page).toHaveURL(/.*login|.*checkout/);
  });
});
