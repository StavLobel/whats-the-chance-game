import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly gameTitle: Locator;
  readonly gameDescription: Locator;
  readonly getStartedButton: Locator;
  readonly signInButton: Locator;
  readonly howItWorksSection: Locator;
  readonly challengeCard: Locator;
  readonly pickNumbersCard: Locator;
  readonly revealDecideCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameTitle = page.getByRole('heading', { name: /what's the chance\?/i });
    this.gameDescription = page.getByText(/the ultimate social game of chance and challenges/i);
    this.getStartedButton = page.getByTestId('get-started-button');
    this.signInButton = page.getByTestId('sign-in-button');
    this.howItWorksSection = page.getByRole('heading', { name: /how it works/i });
    this.challengeCard = page.getByText(/challenge someone/i);
    this.pickNumbersCard = page.getByText(/pick numbers/i);
    this.revealDecideCard = page.getByText(/reveal & decide/i);
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await expect(this.gameTitle).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async verifyHomePageElements() {
    await expect(this.gameTitle).toBeVisible();
    await expect(this.gameDescription).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.signInButton).toBeVisible();
    await expect(this.howItWorksSection).toBeVisible();
    await expect(this.challengeCard).toBeVisible();
    await expect(this.pickNumbersCard).toBeVisible();
    await expect(this.revealDecideCard).toBeVisible();
  }

  async verifyResponsiveDesign() {
    // Check mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.gameTitle).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.signInButton).toBeVisible();

    // Check desktop viewport
    await this.page.setViewportSize({ width: 1200, height: 800 });
    await expect(this.gameTitle).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }
}
