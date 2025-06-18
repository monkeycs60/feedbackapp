import { test, expect } from '@playwright/test';

test.describe('UI Testing - Contrast and Role Switching', () => {
  
  test('should test contrast and role switching functionality', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('input[type="email"]', 'michel@mail.fr');
    await page.fill('input[type="password"]', 'ristifou');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard or onboarding
    await page.waitForLoadState('networkidle');
    
    // Skip onboarding if needed (check if we're on onboarding page)
    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding')) {
      console.log('User is on onboarding, will complete it...');
      // Handle onboarding flow
      await page.waitForSelector('text=Bienvenue', { timeout: 10000 });
      // You might need to complete onboarding steps here
    }
    
    // Wait to be on dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Take screenshot of dashboard for contrast analysis
    await page.screenshot({ path: 'dashboard-contrast.png', fullPage: true });
    
    // Check sidebar elements
    const sidebar = page.locator('[data-testid="sidebar"], .w-64, div:has-text("Salut")').first();
    await expect(sidebar).toBeVisible();
    
    // Check for role indicator
    const roleIndicator = page.locator('text=/Mode (Créateur|Roaster)/');
    await expect(roleIndicator).toBeVisible();
    
    // Get current role text
    const currentRoleText = await roleIndicator.textContent();
    console.log('Current role displayed:', currentRoleText);
    
    // Look for role switch button
    const roleSwitchButton = page.locator('button:has-text("Passer en")');
    
    if (await roleSwitchButton.isVisible()) {
      console.log('Role switch button found');
      
      // Get button text before clicking
      const buttonTextBefore = await roleSwitchButton.textContent();
      console.log('Button text before click:', buttonTextBefore);
      
      // Click the role switch button
      await roleSwitchButton.click();
      
      // Wait for page reload/navigation
      await page.waitForLoadState('networkidle');
      
      // Wait a bit more for any async updates
      await page.waitForTimeout(2000);
      
      // Check if role has changed
      const newRoleText = await page.locator('text=/Mode (Créateur|Roaster)/').textContent();
      console.log('New role displayed:', newRoleText);
      
      // Check if button text has changed
      const newButtonText = await page.locator('button:has-text("Passer en")').textContent();
      console.log('Button text after click:', newButtonText);
      
      // Take screenshot after role switch
      await page.screenshot({ path: 'dashboard-after-role-switch.png', fullPage: true });
      
      // Assertions
      expect(newRoleText).not.toBe(currentRoleText);
      expect(newButtonText).not.toBe(buttonTextBefore);
    } else {
      console.log('Role switch button not found - user might have only one profile');
    }
    
    // Test navigation to other pages
    await page.click('a:has-text("Profil")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'profile-page-contrast.png', fullPage: true });
    
    // Go to marketplace if available
    const marketplaceLink = page.locator('a:has-text("Marketplace")');
    if (await marketplaceLink.isVisible()) {
      await marketplaceLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'marketplace-page-contrast.png', fullPage: true });
    }
    
    // Analyze contrast programmatically
    const bodyBgColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    
    const cardBgColor = await page.evaluate(() => {
      const card = document.querySelector('[class*="card"], .bg-card, [style*="background"]');
      return card ? window.getComputedStyle(card).backgroundColor : 'none';
    });
    
    console.log('Body background color:', bodyBgColor);
    console.log('Card background color:', cardBgColor);
  });
});