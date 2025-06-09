import { test, expect } from '@playwright/test';
import { createTestUser, signUpUser, cleanupTestUser, type TestUser } from '../helpers/auth-helper';

test.describe('Onboarding Flow', () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = await createTestUser();
    await signUpUser(page, testUser);
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUser.email);
  });

  test('should display role selection page for new users', async ({ page }) => {
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

  test('should complete roaster onboarding flow', async ({ page }) => {
    // Step 1: Role selection
    await page.goto('/onboarding/role-selection');
    
    // Select roaster role
    await page.click('[data-testid="roaster-card"]');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveClass(/ring-2/);
    
    // Continue to next step
    await page.click('button:has-text("Continuer")');
    await expect(page).toHaveURL('/onboarding/profile-setup');
    
    // Step 2: Profile setup
    await expect(page.locator('h1')).toContainText('Finalise ton profil');
    await expect(page.locator('text=Quelques infos pour matcher avec les bonnes missions')).toBeVisible();
    
    // Select specialties
    await page.click('[data-testid="specialty-UX"]');
    await page.click('[data-testid="specialty-Dev"]');
    await expect(page.locator('[data-testid="specialty-UX"]')).toHaveClass(/border-orange-500/);
    await expect(page.locator('[data-testid="specialty-Dev"]')).toHaveClass(/border-orange-500/);
    
    // Select experience level
    await page.click('[data-testid="experience-Expert"]');
    await expect(page.locator('[data-testid="experience-Expert"]')).toHaveClass(/border-orange-500/);
    
    // Fill optional bio
    await page.fill('[data-testid="bio-textarea"]', 'UX Designer avec 5 ans d\'expérience dans les SaaS B2B');
    
    // Fill optional portfolio
    await page.fill('[data-testid="portfolio-input"]', 'https://linkedin.com/in/testuser');
    
    // Submit profile
    await page.click('button:has-text("Finaliser mon profil")');
    await expect(page).toHaveURL('/onboarding/welcome');
    
    // Step 3: Welcome screen
    await expect(page.locator('h1')).toContainText('Bienvenue dans RoastMyApp !');
    await expect(page.locator('text=Tu es maintenant prêt à monétiser ton expertise')).toBeVisible();
    
    // Check next steps for roaster
    await expect(page.locator('text=Explore les missions disponibles')).toBeVisible();
    await expect(page.locator('text=Postule à celles qui te correspondent')).toBeVisible();
    await expect(page.locator('text=Gagne tes premiers 3.50€ !')).toBeVisible();
    
    // Check future role preview
    await expect(page.locator('text=Une fois que tu auras donné quelques feedbacks')).toBeVisible();
    
    // Complete onboarding
    await page.click('button:has-text("Voir les missions")');
    await expect(page).toHaveURL('/marketplace');
  });

  test('should complete creator onboarding flow', async ({ page }) => {
    // Step 1: Role selection
    await page.goto('/onboarding/role-selection');
    
    // Select creator role
    await page.click('[data-testid="creator-card"]');
    await expect(page.locator('[data-testid="creator-card"]')).toHaveClass(/ring-2/);
    
    // Continue to next step
    await page.click('button:has-text("Continuer")');
    await expect(page).toHaveURL('/onboarding/profile-setup');
    
    // Step 2: Profile setup (simplified for creator)
    await expect(page.locator('h1')).toContainText('Finalise ton profil');
    await expect(page.locator('text=Quelques infos pour personnaliser ton expérience')).toBeVisible();
    
    // Fill optional company
    await page.fill('[data-testid="company-input"]', 'MonStartup');
    
    // Submit profile
    await page.click('button:has-text("C\'est parti !")');
    await expect(page).toHaveURL('/onboarding/welcome');
    
    // Step 3: Welcome screen
    await expect(page.locator('h1')).toContainText('Bienvenue dans RoastMyApp !');
    await expect(page.locator('text=Tu es maintenant prêt à obtenir des feedbacks brutaux')).toBeVisible();
    
    // Check next steps for creator
    await expect(page.locator('text=Poste ta première app à roaster')).toBeVisible();
    await expect(page.locator('text=Choisis tes roasters (à partir de 5€)')).toBeVisible();
    await expect(page.locator('text=Reçois des feedbacks en 24h')).toBeVisible();
    
    // Check future role preview
    await expect(page.locator('text=Une fois que tu auras reçu des feedbacks')).toBeVisible();
    
    // Complete onboarding
    await page.click('button:has-text("Poster mon app")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect incomplete onboarding users', async ({ page }) => {
    // Try to access main app when onboarding incomplete
    await page.goto('/dashboard');
    
    // Should redirect to appropriate onboarding step
    await expect(page).toHaveURL(/\/onboarding\//);
  });

  test('should show validation errors for incomplete roaster profile', async ({ page }) => {
    // Go to profile setup
    await page.goto('/onboarding/role-selection');
    await page.click('[data-testid="roaster-card"]');
    await page.click('button:has-text("Continuer")');
    
    // Try to submit without required fields
    await page.click('button:has-text("Finaliser mon profil")');
    
    // Should show validation error for specialties
    await expect(page.locator('text=Sélectionne au moins une spécialité')).toBeVisible();
    
    // Fill invalid portfolio URL
    await page.click('[data-testid="specialty-UX"]');
    await page.fill('[data-testid="portfolio-input"]', 'not-a-url');
    await page.click('button:has-text("Finaliser mon profil")');
    
    // Should show URL validation error
    await expect(page.locator('text=URL invalide')).toBeVisible();
  });

  test('should allow role switching hint', async ({ page }) => {
    // Complete roaster onboarding
    await page.goto('/onboarding/role-selection');
    await page.click('[data-testid="roaster-card"]');
    await page.click('button:has-text("Continuer")');
    await page.click('[data-testid="specialty-UX"]');
    await page.click('button:has-text("Finaliser mon profil")');
    
    // On welcome screen, check the hint about future role
    await expect(page.locator('text=💡')).toBeVisible();
    await expect(page.locator('text=Bientôt disponible pour toi')).toBeVisible();
  });
});

test.describe('Onboarding Accessibility', () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = await createTestUser();
    await signUpUser(page, testUser);
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUser.email);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Tab through role cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to select with Enter
    await page.keyboard.press('Enter');
    
    // Continue button should be focusable
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL('/onboarding/profile-setup');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Check ARIA labels exist
    await expect(page.locator('[data-testid="creator-card"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="roaster-card"]')).toHaveAttribute('role', 'button');
  });
});

test.describe('Onboarding Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = await createTestUser();
    await signUpUser(page, testUser);
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUser.email);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Cards should stack vertically on mobile
    const creatorCard = page.locator('[data-testid="creator-card"]');
    const roasterCard = page.locator('[data-testid="roaster-card"]');
    
    const creatorBox = await creatorCard.boundingBox();
    const roasterBox = await roasterCard.boundingBox();
    
    // Cards should be stacked vertically (roaster card below creator card)
    expect(roasterBox!.y).toBeGreaterThan(creatorBox!.y);
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/onboarding/role-selection');
    
    // Buttons should be at least 44px tall for touch targets
    const button = page.locator('button:has-text("Commencer comme Creator")');
    const box = await button.boundingBox();
    
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});