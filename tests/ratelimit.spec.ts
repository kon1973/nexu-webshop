import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

test.describe('Rate Limiting', () => {
  test.setTimeout(120000);
  const email = `admin-${Date.now()}@example.com`;
  const password = 'password123';

  test.beforeAll(async () => {
    test.setTimeout(120000);
    
    // Delete all rate limits to ensure clean state and defaults
    await prisma.setting.deleteMany({ where: { key: { startsWith: 'ratelimit:' } } });
    
    // Wait for cache to expire (30s default TTL)
    console.log('Deleted rate limits. Waiting 35s for cache expiration...');
    await new Promise(resolve => setTimeout(resolve, 35000));
  });

  test.afterAll(async () => {
    try {
      await prisma.user.deleteMany({ where: { email } });
    } catch (e) {
      console.error('Cleanup failed', e);
    }
    await prisma.$disconnect();
  });

  test('Admin can modify rate limits and they are enforced', async ({ page }) => {
    // 1. Create Admin User directly
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date()
      }
    });

    // 2. Login
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/login');
    await page.fill('input[placeholder="Email cím"]', email);
    await page.fill('input[placeholder="Jelszó"]', password);
    
    // Click the specific login button
    const loginButton = page.locator('button:has-text("Bejelentkezés")');
    await loginButton.click();
    
    try {
      await expect(page).toHaveURL('/', { timeout: 15000 });
    } catch (e) {
       const toast = page.locator('[data-sonner-toast]');
       if (await toast.count() > 0) {
         console.log('Toast found:', await toast.allTextContents());
       } else {
         console.log('No toast found.');
       }
       
       const isDisabled = await loginButton.isDisabled();
       console.log('Login button disabled:', isDisabled);

       console.log('Page text:', await page.textContent('body'));
       throw e;
    }

    // 4. Go to Settings -> Rate Limits
    await page.goto('/admin/settings');
    await page.click('button:has-text("Rate limit")');
    await page.click('a[href="/admin/settings/rate-limits"]');

    // 5. Modify "newsletter.subscribe" limit
    const row = page.locator('tr:has(input[value="ratelimit:newsletter.subscribe"])');
    await expect(row).toBeVisible();
    
    const limitInput = row.locator('td:nth-child(2) input');
    await limitInput.fill('2');
    
    const windowInput = row.locator('td:nth-child(3) input');
    await windowInput.fill('10'); // 10 seconds window

    // Save
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Mentés")');
    
    // Wait a bit to ensure DB update is processed
    await page.waitForTimeout(1000);

    // 6. Test the limit
    const targetUrl = '/api/newsletter';
    
    // Request 1
    const res1 = await page.request.post(targetUrl, { data: { email: 'test1@example.com' } });
    expect(res1.status()).toBe(200); 
    
    // Request 2
    const res2 = await page.request.post(targetUrl, { data: { email: 'test2@example.com' } });
    expect(res2.status()).toBe(200);
    
    // Request 3 (Should fail if limit is 2)
    const res3 = await page.request.post(targetUrl, { data: { email: 'test3@example.com' } });
    expect(res3.status()).toBe(429);
  });
});
