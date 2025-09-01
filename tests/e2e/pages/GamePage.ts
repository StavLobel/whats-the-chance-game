/**
 * Game Page Object
 * Encapsulates all game-related page interactions
 */

import { expect, type Locator, type Page } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  
  // Navigation elements
  readonly navBar: Locator;
  readonly createChallengeButton: Locator;
  readonly notificationBell: Locator;
  readonly userMenu: Locator;
  readonly themeToggle: Locator;
  
  // Challenge list elements  
  readonly challengesSection: Locator;
  readonly activeTab: Locator;
  readonly pastTab: Locator;
  readonly challengeCards: Locator;
  readonly emptyChallengesMessage: Locator;
  
  // Challenge interaction elements
  readonly acceptButton: Locator;
  readonly rejectButton: Locator;
  readonly numberInput: Locator;
  readonly submitNumberButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.navBar = page.locator('nav');
    this.createChallengeButton = page.getByRole('button', { name: /create.*challenge/i });
    this.notificationBell = page.locator('button:has(svg.lucide-bell)');
    this.userMenu = page.locator('button[aria-haspopup="true"]');
    this.themeToggle = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
    
    // Challenge list
    this.challengesSection = page.locator('[role="tabpanel"]');
    this.activeTab = page.getByRole('tab', { name: /active/i });
    this.pastTab = page.getByRole('tab', { name: /past/i });
    this.challengeCards = page.locator('[role="article"]');
    this.emptyChallengesMessage = page.getByText(/no.*challenges/i);
    
    // Challenge interactions
    this.acceptButton = page.getByRole('button', { name: /accept/i });
    this.rejectButton = page.getByRole('button', { name: /reject/i });
    this.numberInput = page.getByRole('spinbutton');
    this.submitNumberButton = page.getByRole('button', { name: /submit/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.navBar).toBeVisible();
  }

  async createChallenge(description: string, toUser: string) {
    await this.createChallengeButton.click();
    
    // Wait for modal
    await this.page.waitForSelector('[role="dialog"]');
    
    // Fill form
    await this.page.getByPlaceholder(/describe.*challenge/i).fill(description);
    await this.page.getByPlaceholder(/select.*user/i).fill(toUser);
    
    // Submit
    await this.page.getByRole('button', { name: /create/i }).last().click();
    
    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async acceptChallenge(min: number, max: number) {
    await this.acceptButton.click();
    
    // Wait for range modal
    await this.page.waitForSelector('[role="dialog"]');
    
    // Set range
    await this.page.getByRole('spinbutton', { name: /min/i }).fill(min.toString());
    await this.page.getByRole('spinbutton', { name: /max/i }).fill(max.toString());
    
    // Confirm
    await this.page.getByRole('button', { name: /confirm/i }).click();
    
    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' });
  }

  async rejectChallenge() {
    await this.rejectButton.click();
    
    // Confirm rejection if needed
    const confirmButton = this.page.getByRole('button', { name: /yes.*reject/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }

  async submitNumber(number: number) {
    await this.numberInput.fill(number.toString());
    await this.submitNumberButton.click();
  }

  async getChallengeCount(): Promise<number> {
    const cards = await this.challengeCards.all();
    return cards.length;
  }

  async getChallengeByDescription(description: string): Promise<Locator | null> {
    const challenge = this.page.locator(`[role="article"]:has-text("${description}")`);
    if (await challenge.isVisible()) {
      return challenge;
    }
    return null;
  }

  async waitForChallenge(description: string, timeout = 10000) {
    await expect(
      this.page.locator(`[role="article"]:has-text("${description}")`)
    ).toBeVisible({ timeout });
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.notificationBell.locator('span.animate-bounce-in');
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async isDarkMode(): Promise<boolean> {
    const html = this.page.locator('html');
    const classes = await html.getAttribute('class');
    return classes?.includes('dark') || false;
  }

  async switchToTab(tab: 'active' | 'past') {
    if (tab === 'active') {
      await this.activeTab.click();
    } else {
      await this.pastTab.click();
    }
    
    // Wait for tab content to load
    await this.page.waitForTimeout(500);
  }

  async verifyEmptyState() {
    await expect(this.emptyChallengesMessage).toBeVisible();
  }

  async verifyChallengeStatus(description: string, status: string) {
    const challenge = await this.getChallengeByDescription(description);
    if (challenge) {
      await expect(challenge.locator(`text=/${status}/i`)).toBeVisible();
    } else {
      throw new Error(`Challenge with description "${description}" not found`);
    }
  }
}
