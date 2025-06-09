import { test, expect } from '@playwright/test';

test.describe('Onboarding Pages Basic', () => {
  // Test direct access to onboarding pages (bypassing middleware for now)
  
  test('role selection page loads correctly', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Check page title and description
    await expect(page.locator('h1')).toContainText('Bienvenue sur RoastMyApp');
    await expect(page.locator('text=Comment veux-tu commencer ?')).toBeVisible();
    
    // Check both role cards are present
    await expect(page.locator('[data-testid="creator-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="roaster-card"]')).toBeVisible();
    
    // Check creator card content
    await expect(page.locator('[data-testid="creator-card"] >> text=J\'ai une app à faire roaster')).toBeVisible();
    await expect(page.locator('[data-testid="creator-card"] >> text=✓ Feedback en 24h')).toBeVisible();
    await expect(page.locator('[data-testid="creator-card"] >> text=✓ À partir de 5€')).toBeVisible();
    
    // Check roaster card content  
    await expect(page.locator('[data-testid="roaster-card"] >> text=Je veux gagner de l\'argent')).toBeVisible();
    await expect(page.locator('[data-testid="roaster-card"] >> text=✓ 3.50€ par feedback')).toBeVisible();
    await expect(page.locator('[data-testid="roaster-card"] >> text=✓ Choisis tes missions')).toBeVisible();
    
    // Check reassurance message
    await expect(page.locator('text=💡 Tu pourras facilement switcher plus tard')).toBeVisible();
  });

  test('role selection interaction works', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Click on creator card
    await page.click('[data-testid="creator-card"]');
    await expect(page.locator('[data-testid="creator-card"]')).toHaveClass(/ring-2/);
    
    // Check that continue button appears
    await expect(page.locator('button:has-text("Continuer")')).toBeVisible();
    
    // Click on roaster card instead
    await page.click('[data-testid="roaster-card"]');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveClass(/ring-2/);
    await expect(page.locator('[data-testid="creator-card"]')).not.toHaveClass(/ring-2/);
  });

  test('profile setup page loads correctly', async ({ page }) => {
    await page.goto('/onboarding/profile-setup');
    
    // Should show the setup page (default behavior shows creator form)
    await expect(page.locator('h1')).toContainText('Finalise ton profil');
  });

  test('welcome page loads correctly', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    
    // Should show welcome screen
    await expect(page.locator('h1')).toContainText('Bienvenue dans RoastMyApp !');
    await expect(page.locator('text=Tes prochaines étapes :')).toBeVisible();
  });

  test('dashboard page loads correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('h1')).toContainText('Dashboard Creator');
    await expect(page.locator('text=🚧 Dashboard en cours de développement')).toBeVisible();
  });

  test('marketplace page loads correctly', async ({ page }) => {
    await page.goto('/marketplace');
    
    await expect(page.locator('h1')).toContainText('Marketplace Roaster');
    await expect(page.locator('text=🚧 Marketplace en cours de développement')).toBeVisible();
  });
});

test.describe('Onboarding Accessibility', () => {
  test('role cards have proper ARIA attributes', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Check ARIA labels exist
    await expect(page.locator('[data-testid="creator-card"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="creator-card"]')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveAttribute('tabindex', '0');
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Tab to first card
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="creator-card"]')).toBeFocused();
    
    // Tab to second card
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="roaster-card"]')).toBeFocused();
    
    // Select with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveClass(/ring-2/);
    
    // Continue button should be focusable
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Continuer")')).toBeFocused();
  });
});

test.describe('Onboarding Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('mobile layout works correctly', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Cards should be visible and clickable on mobile
    await expect(page.locator('[data-testid="creator-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="roaster-card"]')).toBeVisible();
    
    // Click should work on mobile
    await page.click('[data-testid="creator-card"]');
    await expect(page.locator('[data-testid="creator-card"]')).toHaveClass(/ring-2/);
  });

  test('touch targets are sufficient size', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Cards should be large enough for touch
    const creatorCard = page.locator('[data-testid="creator-card"]');
    const roasterCard = page.locator('[data-testid="roaster-card"]');
    
    const creatorBox = await creatorCard.boundingBox();
    const roasterBox = await roasterCard.boundingBox();
    
    // Cards should be at least 44px tall for good touch targets
    expect(creatorBox!.height).toBeGreaterThanOrEqual(200); // Cards are much larger
    expect(roasterBox!.height).toBeGreaterThanOrEqual(200);
  });
});