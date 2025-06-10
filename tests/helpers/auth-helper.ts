import { Page } from '@playwright/test';
import { PrismaClient } from '../../app/generated/prisma';

const prisma = new PrismaClient();

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export async function createTestUser(): Promise<TestUser> {
  return {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
  };
}

export async function signUpUser(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  
  await page.getByText('Need an account? Sign up').click();
  await page.waitForLoadState('domcontentloaded');
  
  await page.getByPlaceholder('Name').fill(user.name);
  await page.getByPlaceholder('Email address').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  
  await page.getByRole('button', { name: 'Sign up' }).click();
  
  // Wait longer for signup to complete - try both possible redirects
  try {
    await page.waitForURL('/onboarding/role-selection', { timeout: 15000 });
  } catch {
    try {
      // If not redirected to onboarding, check if redirected to home
      await page.waitForURL('/', { timeout: 10000 });
      // If redirected to home, try to navigate to any page that will trigger onboarding
      await page.goto('/dashboard');
      await page.waitForURL('/onboarding/role-selection', { timeout: 15000 });
    } catch {
      // Last resort - try accessing a protected page directly
      await page.goto('/profile');
      await page.waitForURL('/onboarding/role-selection', { timeout: 15000 });
    }
  }
  
  // Wait for the page to be fully loaded with all resources
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Wait for role selection page specific elements to be ready
  await page.waitForSelector('[data-testid="creator-card"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="roaster-card"]', { timeout: 10000 });
}

export async function loginUser(page: Page, user: TestUser) {
  await page.goto('/login');
  
  await page.getByPlaceholder('Email address').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(1000);
}

export async function cleanupTestUser(email: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Delete related records first
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
      
      await prisma.account.deleteMany({
        where: { userId: user.id },
      });
      
      await prisma.creatorProfile.deleteMany({
        where: { userId: user.id },
      });
      
      await prisma.roasterProfile.deleteMany({
        where: { userId: user.id },
      });

      // Delete the user
      await prisma.user.delete({
        where: { id: user.id },
      });
    }
  } catch (error) {
    console.error('Error cleaning up test user:', error);
  }
}

export async function completeOnboarding(page: Page, role: 'creator' | 'roaster' = 'creator') {
  // Should already be on /onboarding/role-selection after signup
  await page.waitForURL('/onboarding/role-selection', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Wait for role cards to be ready
  await page.waitForSelector('[data-testid="creator-card"]', { timeout: 10000 });
  await page.waitForSelector('[data-testid="roaster-card"]', { timeout: 10000 });
  
  // Select role
  if (role === 'creator') {
    await page.click('[data-testid="creator-card"]');
  } else {
    await page.click('[data-testid="roaster-card"]');
  }
  
  // Wait for selection to be processed
  await page.waitForTimeout(1000);
  
  // Continue to profile setup
  await page.click('button:has-text("Continuer")');
  await page.waitForURL('/onboarding/profile-setup', { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  if (role === 'creator') {
    // Creator profile setup is simpler - wait for form to be ready
    await page.waitForSelector('button:has-text("C\'est parti !")', { timeout: 10000 });
    await page.waitForTimeout(1000); // Wait a bit to ensure form is ready
    await page.click('button:has-text("C\'est parti !")');
  } else {
    // Roaster profile setup requires specialties - wait for specialty options
    await page.waitForSelector('[data-testid="specialty-UX"]', { timeout: 10000 });
    await page.click('[data-testid="specialty-UX"]');
    await page.waitForSelector('button:has-text("Finaliser mon profil")', { timeout: 10000 });
    await page.waitForTimeout(1000); // Wait a bit to ensure form is ready
    await page.click('button:has-text("Finaliser mon profil")');
  }
  
  // Wait for form submission to complete and navigate to welcome
  await page.waitForURL('/onboarding/welcome', { timeout: 20000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  if (role === 'creator') {
    await page.waitForSelector('button:has-text("Poster mon app")', { timeout: 10000 });
    await page.click('button:has-text("Poster mon app")');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  } else {
    await page.waitForSelector('button:has-text("Voir les missions")', { timeout: 10000 });
    await page.click('button:has-text("Voir les missions")');
    await page.waitForURL('/marketplace', { timeout: 15000 });
  }
  
  // Final wait for page to be ready
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

export async function cleanupAllTestUsers() {
  try {
    // Delete test users (those with email containing 'test' and '@example.com')
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '@example.com',
        },
      },
    });

    for (const user of testUsers) {
      await cleanupTestUser(user.email);
    }
  } catch (error) {
    console.error('Error cleaning up all test users:', error);
  }
}