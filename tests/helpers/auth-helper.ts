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
  await page.getByText('Need an account? Sign up').click();
  
  await page.getByPlaceholder('Name').fill(user.name);
  await page.getByPlaceholder('Email address').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  
  await page.getByRole('button', { name: 'Sign up' }).click();
  
  // Wait for signup to complete and redirect to onboarding
  await page.waitForURL('/onboarding/role-selection', { timeout: 10000 });
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('domcontentloaded');
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