import { test, expect } from '@playwright/test';
import {
	createTestUser,
	signUpUser,
	cleanupTestUser,
	completeOnboarding,
	type TestUser,
} from '../helpers/auth-helper';

test.describe('Roast Request System', () => {
	let testUser: TestUser;

	test.beforeEach(async ({ page }) => {
		testUser = await createTestUser();
		await signUpUser(page, testUser);
		await completeOnboarding(page, 'creator');
	});

	test.afterEach(async () => {
		await cleanupTestUser(testUser.email);
	});

	test('should display empty state when no roast requests exist', async ({
		page,
	}) => {
		await page.goto('/dashboard');

		// Check dashboard loads
		await expect(page.locator('h1')).toContainText('Salut');

		// Check empty state
		await expect(page.locator('text=Aucune demande de roast')).toBeVisible();
		await expect(
			page.locator('text=Commence par poster ta première app')
		).toBeVisible();
		await expect(
			page.locator('text=Créer ma première demande')
		).toBeVisible();

		// Check stats show zeros
		await expect(page.locator('[data-testid="stat-total-requests"]')).toContainText('0');
		await expect(page.locator('[data-testid="stat-active-requests"]')).toContainText('0');
		await expect(page.locator('[data-testid="stat-completed-requests"]')).toContainText('0');
		await expect(page.locator('[data-testid="stat-feedbacks-received"]')).toContainText('0');
	});

	test('should navigate to new roast form from dashboard', async ({
		page,
	}) => {
		await page.goto('/dashboard');

		// Click on main CTA in empty state
		await page.click('text=Créer ma première demande');
		await expect(page).toHaveURL('/dashboard/new-roast');

		// Go back and try header CTA
		await page.goto('/dashboard');
		await page.click('text=Nouvelle demande');
		await expect(page).toHaveURL('/dashboard/new-roast');
	});

	test('should display new roast form with all required fields', async ({
		page,
	}) => {
		await page.goto('/dashboard/new-roast');

		// Check page title and description
		await expect(page.locator('h1')).toContainText('Nouvelle demande de roast');
		await expect(
			page.locator('text=Obtiens des feedbacks détaillés')
		).toBeVisible();

		// Check form sections
		await expect(page.locator('text=Informations de base')).toBeVisible();
		await expect(page.locator('text=Domaines de feedback')).toBeVisible();
		await expect(page.locator('text=Budget et publication')).toBeVisible();

		// Check required fields
		await expect(page.locator('[data-testid="title-input"]')).toBeVisible();
		await expect(page.locator('[data-testid="app-url-input"]')).toBeVisible();
		await expect(page.locator('[data-testid="description-textarea"]')).toBeVisible();
		await expect(page.locator('[data-testid="target-audience-textarea"]')).toBeVisible();

		// Check focus areas
		await expect(page.locator('[data-testid="focus-UX"]')).toBeVisible();
		await expect(page.locator('[data-testid="focus-Performance"]')).toBeVisible();
		await expect(page.locator('[data-testid="focus-Accessibilité"]')).toBeVisible();
		await expect(page.locator('[data-testid="focus-SEO"]')).toBeVisible();
		await expect(page.locator('[data-testid="focus-Sécurité"]')).toBeVisible();
		await expect(page.locator('[data-testid="focus-Code Quality"]')).toBeVisible();

		// Check price options
		await expect(page.locator('[data-testid="price-5"]')).toBeVisible();
		await expect(page.locator('[data-testid="price-10"]')).toBeVisible();
		await expect(page.locator('[data-testid="price-15"]')).toBeVisible();
		await expect(page.locator('[data-testid="price-25"]')).toBeVisible();
		await expect(page.locator('[data-testid="price-50"]')).toBeVisible();
		await expect(page.locator('[data-testid="price-custom"]')).toBeVisible();

		// Check submit button
		await expect(page.locator('button:has-text("Publier ma demande")')).toBeVisible();
	});

	test('should show validation errors for incomplete form submission', async ({
		page,
	}) => {
		await page.goto('/dashboard/new-roast');

		// Try to submit empty form
		await page.click('button:has-text("Publier ma demande")');

		// Check validation errors
		await expect(page.locator('text=Le titre est requis')).toBeVisible();
		await expect(page.locator('text=L\'URL de l\'app est requise')).toBeVisible();
		await expect(page.locator('text=La description est requise')).toBeVisible();
		await expect(page.locator('text=L\'audience cible est requise')).toBeVisible();
		await expect(
			page.locator('text=Sélectionne au moins un domaine de feedback')
		).toBeVisible();
		await expect(page.locator('text=Sélectionne un budget')).toBeVisible();
	});

	test('should validate URL format', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Fill invalid URL
		await page.fill('[data-testid="app-url-input"]', 'not-a-valid-url');
		await page.fill('[data-testid="title-input"]', 'Test App');
		await page.click('button:has-text("Publier ma demande")');

		// Check URL validation error
		await expect(page.locator('text=URL invalide')).toBeVisible();
	});

	test('should successfully create a roast request with minimum required fields', async ({
		page,
	}) => {
		await page.goto('/dashboard/new-roast');

		// Fill required fields
		await page.fill('[data-testid="title-input"]', 'Mon App de Test');
		await page.fill('[data-testid="app-url-input"]', 'https://myapp.example.com');
		await page.fill(
			'[data-testid="description-textarea"]',
			'Une application de test pour valider les fonctionnalités de roasting.'
		);
		await page.fill(
			'[data-testid="target-audience-textarea"]',
			'Développeurs et entrepreneurs tech'
		);

		// Select focus areas
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="focus-Performance"]');

		// Verify focus areas are selected
		await expect(page.locator('[data-testid="focus-UX"]')).toHaveClass(/border-blue-500/);
		await expect(page.locator('[data-testid="focus-Performance"]')).toHaveClass(/border-blue-500/);

		// Select price
		await page.click('[data-testid="price-15"]');
		await expect(page.locator('[data-testid="price-15"]')).toHaveClass(/border-blue-500/);

		// Submit form
		await page.click('button:has-text("Publier ma demande")');

		// Should redirect to dashboard
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await page.waitForLoadState('domcontentloaded');
		await page.waitForLoadState('networkidle', { timeout: 10000 });

		// Check success feedback
		await expect(page.locator('text=Mon App de Test')).toBeVisible();

		// Check stats are updated
		await expect(page.locator('[data-testid="stat-total-requests"]')).toContainText('1');
		await expect(page.locator('[data-testid="stat-active-requests"]')).toContainText('1');
	});

	test('should successfully create a roast request with custom price', async ({
		page,
	}) => {
		await page.goto('/dashboard/new-roast');

		// Fill required fields
		await page.fill('[data-testid="title-input"]', 'App Premium');
		await page.fill('[data-testid="app-url-input"]', 'https://premium.example.com');
		await page.fill(
			'[data-testid="description-textarea"]',
			'Application premium nécessitant un feedback approfondi.'
		);
		await page.fill(
			'[data-testid="target-audience-textarea"]',
			'Entreprises B2B'
		);

		// Select focus areas
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="focus-Sécurité"]');
		await page.click('[data-testid="focus-Code Quality"]');

		// Select custom price
		await page.click('[data-testid="price-custom"]');
		
		// Custom price input should appear
		await expect(page.locator('[data-testid="custom-price-input"]')).toBeVisible();
		await page.fill('[data-testid="custom-price-input"]', '75');

		// Submit form
		await page.click('button:has-text("Publier ma demande")');

		// Should redirect to dashboard
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await page.waitForLoadState('domcontentloaded');
		await page.waitForLoadState('networkidle', { timeout: 10000 });

		// Check the request appears with custom price
		await expect(page.locator('text=App Premium')).toBeVisible();
		await expect(page.locator('text=75€')).toBeVisible();
	});

	test('should display roast request details page', async ({ page }) => {
		// First create a roast request
		await page.goto('/dashboard/new-roast');
		
		await page.fill('[data-testid="title-input"]', 'Détails Test App');
		await page.fill('[data-testid="app-url-input"]', 'https://details.example.com');
		await page.fill(
			'[data-testid="description-textarea"]',
			'Application pour tester l\'affichage des détails.'
		);
		await page.fill(
			'[data-testid="target-audience-textarea"]',
			'Testeurs QA'
		);
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-10"]');
		await page.click('button:has-text("Publier ma demande")');

		// Wait for redirect to dashboard
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await page.waitForLoadState('networkidle', { timeout: 10000 });

		// Click on "Voir détails" button
		await page.click('text=Voir détails');

		// Should be on detail page
		await expect(page).toHaveURL(/\/dashboard\/roast\/[a-zA-Z0-9]+/);

		// Check page content
		await expect(page.locator('h1')).toContainText('Détails Test App');
		await expect(page.locator('text=Ouvert')).toBeVisible(); // Status badge
		await expect(page.locator('text=Application pour tester')).toBeVisible();
		await expect(page.locator('text=Testeurs QA')).toBeVisible();
		await expect(page.locator('text=UX')).toBeVisible(); // Focus area badge
		await expect(page.locator('text=10€')).toBeVisible(); // Price
		await expect(page.locator('text=https://details.example.com')).toBeVisible();

		// Check action buttons for open request
		await expect(page.locator('button:has-text("Modifier")')).toBeVisible();
		await expect(page.locator('button:has-text("Mettre en pause")')).toBeVisible();
		await expect(page.locator('button:has-text("Supprimer")')).toBeVisible();

		// Check back button works
		await page.click('text=← Retour au dashboard');
		await expect(page).toHaveURL('/dashboard');
	});

	test('should validate custom price range', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Fill required fields
		await page.fill('[data-testid="title-input"]', 'Price Test');
		await page.fill('[data-testid="app-url-input"]', 'https://price.example.com');
		await page.fill('[data-testid="description-textarea"]', 'Test description');
		await page.fill('[data-testid="target-audience-textarea"]', 'Test audience');
		await page.click('[data-testid="focus-UX"]');

		// Select custom price
		await page.click('[data-testid="price-custom"]');

		// Test minimum price validation
		await page.fill('[data-testid="custom-price-input"]', '4');
		await page.click('button:has-text("Publier ma demande")');
		await expect(page.locator('text=Le budget doit être au minimum de 5€')).toBeVisible();

		// Test maximum price validation
		await page.fill('[data-testid="custom-price-input"]', '501');
		await page.click('button:has-text("Publier ma demande")');
		await expect(page.locator('text=Le budget ne peut pas dépasser 500€')).toBeVisible();

		// Test valid custom price
		await page.fill('[data-testid="custom-price-input"]', '30');
		await page.click('button:has-text("Publier ma demande")');

		// Should succeed
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await page.waitForLoadState('networkidle', { timeout: 10000 });
		await expect(page.locator('text=30€')).toBeVisible();
	});

	test('should handle form navigation and state persistence', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Fill first section
		await page.fill('[data-testid="title-input"]', 'Navigation Test');
		await page.fill('[data-testid="app-url-input"]', 'https://nav.example.com');

		// Navigate away and back
		await page.goto('/dashboard');
		await page.goto('/dashboard/new-roast');

		// Form should be empty (no persistence by design)
		await expect(page.locator('[data-testid="title-input"]')).toHaveValue('');
		await expect(page.locator('[data-testid="app-url-input"]')).toHaveValue('');
	});

	test('should show appropriate loading states during form submission', async ({
		page,
	}) => {
		await page.goto('/dashboard/new-roast');

		// Fill valid form
		await page.fill('[data-testid="title-input"]', 'Loading Test');
		await page.fill('[data-testid="app-url-input"]', 'https://loading.example.com');
		await page.fill('[data-testid="description-textarea"]', 'Test loading states');
		await page.fill('[data-testid="target-audience-textarea"]', 'Testers');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-15"]');

		// Click submit and check for loading state
		await page.click('button:has-text("Publier ma demande")');
		
		// Button should show loading state
		await expect(page.locator('button:has-text("Publication...")')).toBeVisible({ timeout: 2000 });
	});
});

test.describe('Roast Request System - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
	let testUser: TestUser;

	test.beforeEach(async ({ page }) => {
		testUser = await createTestUser();
		await signUpUser(page, testUser);
		await completeOnboarding(page, 'creator');
	});

	test.afterEach(async () => {
		await cleanupTestUser(testUser.email);
	});

	test('should work properly on mobile viewport', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Check form is usable on mobile
		await expect(page.locator('[data-testid="title-input"]')).toBeVisible();
		
		// Focus areas should stack properly
		const focusUX = page.locator('[data-testid="focus-UX"]');
		const focusPerf = page.locator('[data-testid="focus-Performance"]');
		
		await expect(focusUX).toBeVisible();
		await expect(focusPerf).toBeVisible();

		// Price options should be responsive
		await expect(page.locator('[data-testid="price-5"]')).toBeVisible();

		// Fill form on mobile
		await page.fill('[data-testid="title-input"]', 'Mobile Test');
		await page.fill('[data-testid="app-url-input"]', 'https://mobile.example.com');
		await page.fill('[data-testid="description-textarea"]', 'Mobile test description');
		await page.fill('[data-testid="target-audience-textarea"]', 'Mobile users');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-10"]');

		// Submit should work
		await page.click('button:has-text("Publier ma demande")');
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await expect(page.locator('text=Mobile Test')).toBeVisible();
	});

	test('should have touch-friendly interface elements', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Check touch targets are large enough (minimum 44px)
		const focusButton = page.locator('[data-testid="focus-UX"]');
		const focusBox = await focusButton.boundingBox();
		expect(focusBox!.height).toBeGreaterThanOrEqual(40);

		const priceButton = page.locator('[data-testid="price-15"]');
		const priceBox = await priceButton.boundingBox();
		expect(priceBox!.height).toBeGreaterThanOrEqual(40);

		const submitButton = page.locator('button:has-text("Publier ma demande")');
		const submitBox = await submitButton.boundingBox();
		expect(submitBox!.height).toBeGreaterThanOrEqual(44);
	});
});

test.describe('Roast Request System - Accessibility', () => {
	let testUser: TestUser;

	test.beforeEach(async ({ page }) => {
		testUser = await createTestUser();
		await signUpUser(page, testUser);
		await completeOnboarding(page, 'creator');
	});

	test.afterEach(async () => {
		await cleanupTestUser(testUser.email);
	});

	test('should have proper form labels and ARIA attributes', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Check form labels
		await expect(page.locator('label[for="title"]')).toBeVisible();
		await expect(page.locator('label[for="appUrl"]')).toBeVisible();
		await expect(page.locator('label[for="description"]')).toBeVisible();
		await expect(page.locator('label[for="targetAudience"]')).toBeVisible();

		// Check ARIA attributes on interactive elements
		await expect(page.locator('[data-testid="focus-UX"]')).toHaveAttribute('role', 'button');
		await expect(page.locator('[data-testid="price-15"]')).toHaveAttribute('role', 'button');

		// Check form validation attributes
		await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('required');
		await expect(page.locator('[data-testid="app-url-input"]')).toHaveAttribute('required');
	});

	test('should be keyboard navigable', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Tab through form elements
		await page.press('body', 'Tab');
		await expect(page.locator('[data-testid="title-input"]')).toBeFocused();

		await page.press('body', 'Tab');
		await expect(page.locator('[data-testid="app-url-input"]')).toBeFocused();

		await page.press('body', 'Tab');
		await expect(page.locator('[data-testid="description-textarea"]')).toBeFocused();

		// Focus areas should be keyboard accessible
		// Navigate to focus section and use space/enter to select
		await page.locator('[data-testid="focus-UX"]').scrollIntoViewIfNeeded();
		
		// Focus UX button and activate with keyboard
		await page.locator('[data-testid="focus-UX"]').focus();
		await page.press('[data-testid="focus-UX"]', 'Space');
		await expect(page.locator('[data-testid="focus-UX"]')).toHaveClass(/border-blue-500/);
	});

	test('should provide clear error messages with proper ARIA labels', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Submit empty form
		await page.click('button:has-text("Publier ma demande")');

		// Error messages should be associated with form fields
		const titleError = page.locator('text=Le titre est requis');
		await expect(titleError).toBeVisible();

		// Error should be announced to screen readers
		await expect(titleError).toHaveAttribute('role', 'alert');
	});
});

test.describe('Roast Request System - Edge Cases', () => {
	let testUser: TestUser;

	test.beforeEach(async ({ page }) => {
		testUser = await createTestUser();
		await signUpUser(page, testUser);
		await completeOnboarding(page, 'creator');
	});

	test.afterEach(async () => {
		await cleanupTestUser(testUser.email);
	});

	test('should handle very long text inputs gracefully', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		const longTitle = 'A'.repeat(200);
		const longDescription = 'B'.repeat(2000);
		const longAudience = 'C'.repeat(500);

		// Fill with long text
		await page.fill('[data-testid="title-input"]', longTitle);
		await page.fill('[data-testid="description-textarea"]', longDescription);
		await page.fill('[data-testid="target-audience-textarea"]', longAudience);
		await page.fill('[data-testid="app-url-input"]', 'https://longtext.example.com');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-15"]');

		// Should show validation errors for too long text
		await page.click('button:has-text("Publier ma demande")');
		
		// Check for character limit validation
		await expect(page.locator('text=Le titre ne peut pas dépasser 100 caractères')).toBeVisible();
		await expect(page.locator('text=La description ne peut pas dépasser 1000 caractères')).toBeVisible();
	});

	test('should handle special characters in URLs and text', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Test with special characters
		await page.fill('[data-testid="title-input"]', 'Test: App (v2.0) - "Special" & More!');
		await page.fill('[data-testid="app-url-input"]', 'https://example.com/app?param=value&test=123#section');
		await page.fill('[data-testid="description-textarea"]', 'Description with émojis 🚀 and special chars: @#$%^&*()');
		await page.fill('[data-testid="target-audience-textarea"]', 'Audience: développeurs français & internationaux');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-15"]');

		// Should handle special characters properly
		await page.click('button:has-text("Publier ma demande")');
		await page.waitForURL('/dashboard', { timeout: 10000 });
		
		// Check special characters are preserved
		await expect(page.locator('text=Test: App (v2.0) - "Special" & More!')).toBeVisible();
	});

	test('should prevent duplicate submissions', async ({ page }) => {
		await page.goto('/dashboard/new-roast');

		// Fill valid form
		await page.fill('[data-testid="title-input"]', 'Duplicate Test');
		await page.fill('[data-testid="app-url-input"]', 'https://duplicate.example.com');
		await page.fill('[data-testid="description-textarea"]', 'Test duplicate submission');
		await page.fill('[data-testid="target-audience-textarea"]', 'Testers');
		await page.click('[data-testid="focus-UX"]');
		await page.click('[data-testid="price-15"]');

		// Submit form multiple times quickly
		const submitButton = page.locator('button:has-text("Publier ma demande")');
		await Promise.all([
			submitButton.click(),
			submitButton.click(), // Second click should be ignored
		]);

		// Should only create one request
		await page.waitForURL('/dashboard', { timeout: 10000 });
		await page.waitForLoadState('networkidle', { timeout: 10000 });
		
		// Check only one request exists
		await expect(page.locator('[data-testid="stat-total-requests"]')).toContainText('1');
	});
});