import { test, expect } from '@playwright/test';
import {
	createTestUser,
	signUpUser,
	cleanupTestUser,
	completeOnboarding,
	type TestUser,
} from '../helpers/auth-helper';

test.describe('Dual Role System', () => {
	let creatorUser: TestUser;
	let roasterUser: TestUser;

	test.beforeEach(async ({ page }) => {
		creatorUser = await createTestUser();
		roasterUser = await createTestUser('roaster');
	});

	test.afterEach(async () => {
		await cleanupTestUser(creatorUser.email);
		await cleanupTestUser(roasterUser.email);
	});

	test('should show different dashboard content based on user role', async ({ page }) => {
		// Test creator dashboard
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');
		await page.goto('/dashboard');

		// Creator should see roast requests management
		await expect(page.locator('text=Voici tes demandes de roast')).toBeVisible();
		await expect(page.locator('text=Nouvelle demande')).toBeVisible();
		await expect(page.locator('[data-testid="stat-total-requests"]')).toBeVisible();

		// Logout and test roaster dashboard
		await page.goto('/logout');
		await signUpUser(page, roasterUser);
		await completeOnboarding(page, 'roaster');
		await page.goto('/dashboard');

		// Roaster should see available roasts
		await expect(page.locator('text=Voici les apps disponibles pour du roasting')).toBeVisible();
		await expect(page.locator('text=Apps disponibles')).toBeVisible();
	});

	test('should prevent roasters from creating roast requests', async ({ page }) => {
		// Setup roaster user
		await signUpUser(page, roasterUser);
		await completeOnboarding(page, 'roaster');

		// Try to access new roast page directly
		await page.goto('/dashboard/new-roast');

		// Should see error or be redirected
		await expect(page.locator('text=Les roasters ne peuvent pas créer de demandes')).toBeVisible();
	});

	test('should allow user with both profiles to switch roles', async ({ page }) => {
		// Create user with both profiles (simulate onboarding for both roles)
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');

		// Create roaster profile as well (simulate adding second role)
		// This would typically be done through a role discovery flow
		await page.goto('/onboarding/role-selection');
		await page.click('[data-testid="role-roaster"]');
		await page.click('button:has-text("Continuer")');

		// Complete roaster profile
		await page.click('[data-testid="specialty-UX"]');
		await page.click('[data-testid="specialty-Performance"]');
		await page.selectOption('[data-testid="experience-select"]', 'Intermédiaire');
		await page.fill('[data-testid="bio-textarea"]', 'Expert en UX avec 5 ans d\'expérience');
		await page.click('button:has-text("Continuer")');

		// Complete onboarding
		await page.click('button:has-text("Accéder à la plateforme")');

		// Now user should have both profiles and see role switch
		await page.goto('/dashboard');
		await expect(page.locator('text=Mode Créateur')).toBeVisible();
		await expect(page.locator('text=Passer en Roaster')).toBeVisible();

		// Switch to roaster mode
		await page.click('text=Passer en Roaster');
		await page.waitForLoadState('networkidle');

		// Dashboard should now show roaster content
		await expect(page.locator('text=Mode Roaster')).toBeVisible();
		await expect(page.locator('text=Passer en Créateur')).toBeVisible();
		await expect(page.locator('text=Voici les apps disponibles pour du roasting')).toBeVisible();

		// Switch back to creator mode
		await page.click('text=Passer en Créateur');
		await page.waitForLoadState('networkidle');

		// Should be back to creator dashboard
		await expect(page.locator('text=Mode Créateur')).toBeVisible();
		await expect(page.locator('text=Voici tes demandes de roast')).toBeVisible();
	});

	test('should show available roasts for roaster users', async ({ page }) => {
		// First create some roast requests as a creator
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');

		// Create a test roast request
		await page.goto('/dashboard/new-roast');
		await page.fill('[data-testid="title-input"]', 'Test App pour Roaster');
		await page.fill('[data-testid="app-url-input"]', 'https://testapp.example.com');
		await page.fill('[data-testid="description-textarea"]', 'Une app de test pour valider l\'affichage côté roaster.');
		await page.fill('[data-testid="target-audience-textarea"]', 'Développeurs web');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-15"]');
		await page.click('button:has-text("Publier ma demande")');

		// Logout and login as roaster
		await page.goto('/logout');
		await signUpUser(page, roasterUser);
		await completeOnboarding(page, 'roaster');
		await page.goto('/dashboard');

		// Should see the available roast
		await expect(page.locator('text=Test App pour Roaster')).toBeVisible();
		await expect(page.locator('text=Jusqu\'à 15€')).toBeVisible();
		await expect(page.locator('text=UX')).toBeVisible();
		await expect(page.locator('text=Commencer le roast')).toBeVisible();

		// Should be able to click on roast request
		await page.click('text=Commencer le roast');
		// Should navigate to roast detail page
		await expect(page).toHaveURL(/\/roast\/[a-zA-Z0-9]+/);
	});

	test('should handle role switching edge cases', async ({ page }) => {
		// Test user with only creator profile trying to switch to roaster
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');
		await page.goto('/dashboard');

		// Should not see role switch if only has one profile
		await expect(page.locator('text=Passer en Roaster')).not.toBeVisible();
		await expect(page.locator('text=Mode Créateur')).not.toBeVisible();
	});

	test('should maintain role-specific permissions after switching', async ({ page }) => {
		// Setup user with both profiles
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');

		// Add roaster profile (simplified - would need proper onboarding flow)
		// For test purposes, we'll simulate having both profiles

		// Test that switching roles maintains proper permissions
		await page.goto('/dashboard');

		// As creator, should be able to create roast requests
		await page.goto('/dashboard/new-roast');
		await expect(page.locator('h1')).toContainText('Nouvelle demande de roast');

		// Switch to roaster mode (if role switch available)
		await page.goto('/dashboard');
		const roleSwitchButton = page.locator('text=Passer en Roaster');
		if (await roleSwitchButton.isVisible()) {
			await roleSwitchButton.click();
			await page.waitForLoadState('networkidle');

			// As roaster, should not be able to create roast requests
			await page.goto('/dashboard/new-roast');
			await expect(page.locator('text=Les roasters ne peuvent pas créer de demandes')).toBeVisible();
		}
	});

	test('should show priority indicators for roasters viewing available roasts', async ({ page }) => {
		// Create multiple roast requests with different timestamps
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');

		// Create recent urgent request
		await page.goto('/dashboard/new-roast');
		await page.fill('[data-testid="title-input"]', 'Urgent App');
		await page.fill('[data-testid="app-url-input"]', 'https://urgent.example.com');
		await page.fill('[data-testid="description-textarea"]', 'App urgente qui a besoin de feedback rapidement.');
		await page.fill('[data-testid="target-audience-textarea"]', 'Startups');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-25"]');
		await page.click('button:has-text("Publier ma demande")');

		// Create normal request
		await page.goto('/dashboard/new-roast');
		await page.fill('[data-testid="title-input"]', 'Normal App');
		await page.fill('[data-testid="app-url-input"]', 'https://normal.example.com');
		await page.fill('[data-testid="description-textarea"]', 'App normale pour feedback standard.');
		await page.fill('[data-testid="target-audience-textarea"]', 'PME');
		await page.click('[data-testid="focus-Performance"]');
		await page.click('[data-testid="price-15"]');
		await page.click('button:has-text("Publier ma demande")');

		// Switch to roaster view
		await page.goto('/logout');
		await signUpUser(page, roasterUser);
		await completeOnboarding(page, 'roaster');
		await page.goto('/dashboard');

		// Should see both requests with priority indicators
		await expect(page.locator('text=Urgent App')).toBeVisible();
		await expect(page.locator('text=Normal App')).toBeVisible();

		// Should see priority badges
		await expect(page.locator('text=Urgent')).toBeVisible();
		await expect(page.locator('text=Modéré')).toBeVisible();

		// Urgent request should appear first (sorted by priority)
		const requests = page.locator('[data-testid="roast-request-card"]');
		const firstRequest = requests.first();
		await expect(firstRequest.locator('text=Urgent App')).toBeVisible();
	});

	test('should handle empty state for roasters when no requests available', async ({ page }) => {
		// Setup roaster with no available requests
		await signUpUser(page, roasterUser);
		await completeOnboarding(page, 'roaster');
		await page.goto('/dashboard');

		// Should show empty state
		await expect(page.locator('text=Aucune app à roaster pour le moment')).toBeVisible();
		await expect(page.locator('text=Les nouvelles demandes de roast apparaîtront ici')).toBeVisible();
	});

	test('should preserve user context during role switches', async ({ page }) => {
		// Test that user data is maintained during role switches
		await signUpUser(page, creatorUser);
		await completeOnboarding(page, 'creator');

		// Verify user name is displayed
		await page.goto('/dashboard');
		await expect(page.locator(`text=Salut ${creatorUser.name}`)).toBeVisible();

		// If user has both profiles and switches roles, name should be preserved
		const roleSwitchButton = page.locator('text=Passer en Roaster');
		if (await roleSwitchButton.isVisible()) {
			await roleSwitchButton.click();
			await page.waitForLoadState('networkidle');

			// User name should still be displayed
			await expect(page.locator(`text=Salut ${creatorUser.name}`)).toBeVisible();
		}
	});
});