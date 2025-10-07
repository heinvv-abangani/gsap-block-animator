import { Page, expect } from '@playwright/test';

export class GSAPTestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for and verify GSAP animation panel is visible
   */
  async waitForGSAPPanel() {
    await this.page.waitForSelector('[data-testid="gsap-animation-panel"]', { timeout: 10000 });
    await expect(this.page.locator('[data-testid="gsap-animation-panel"]')).toBeVisible();
  }

  /**
   * Configure GSAP animation with specified settings
   */
  async configureGSAPAnimation(settings: {
    activate?: boolean;
    movementX?: string;
    duration?: string;
    delay?: string;
  }) {
    await this.waitForGSAPPanel();

    if (settings.activate) {
      const toggle = this.page.locator('[data-testid="gsap-animation-toggle"]');
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toBeChecked();
    }

    if (settings.movementX) {
      const input = this.page.locator('[data-testid="movement-x-input"]');
      await expect(input).toBeVisible();
      await input.clear();
      await input.fill(settings.movementX);
    }

    if (settings.duration) {
      const input = this.page.locator('[data-testid="duration-input"]');
      await expect(input).toBeVisible();
      await input.clear();
      await input.fill(settings.duration);
    }

    if (settings.delay) {
      const input = this.page.locator('[data-testid="delay-input"]');
      await expect(input).toBeVisible();
      await input.clear();
      await input.fill(settings.delay);
    }
  }

  /**
   * Verify GSAP settings match expected values
   */
  async verifyGSAPSettings(expectedSettings: {
    activated?: boolean;
    movementX?: string;
    duration?: string;
    delay?: string;
  }) {
    await this.waitForGSAPPanel();

    if (expectedSettings.activated !== undefined) {
      const toggle = this.page.locator('[data-testid="gsap-animation-toggle"]');
      if (expectedSettings.activated) {
        await expect(toggle).toBeChecked();
      } else {
        await expect(toggle).not.toBeChecked();
      }
    }

    if (expectedSettings.movementX) {
      await expect(this.page.locator('[data-testid="movement-x-input"]')).toHaveValue(expectedSettings.movementX);
    }

    if (expectedSettings.duration) {
      await expect(this.page.locator('[data-testid="duration-input"]')).toHaveValue(expectedSettings.duration);
    }

    if (expectedSettings.delay) {
      await expect(this.page.locator('[data-testid="delay-input"]')).toHaveValue(expectedSettings.delay);
    }
  }

  /**
   * Open block settings panel
   */
  async openBlockSettings() {
    await this.page.click('[aria-label="Block Settings"]');
  }

  /**
   * Save the current post/page
   */
  async savePost() {
    await this.page.click('[aria-label="Save draft"]');
    await this.page.waitForSelector('.is-saved', { timeout: 10000 });
  }

  /**
   * Add a paragraph block with text
   */
  async addParagraphBlock(text: string) {
    // Try different methods to add a paragraph block
    
    // Method 1: Click the main content area (works for most cases)
    const contentArea = this.page.locator('.block-editor-writing-flow, .edit-post-visual-editor');
    if (await contentArea.isVisible()) {
      await contentArea.click();
      await this.page.keyboard.type(text);
      return;
    }
    
    // Method 2: Click the "Type / to choose a block" placeholder
    const placeholder = this.page.locator('text="Type / to choose a block"');
    if (await placeholder.isVisible()) {
      await placeholder.click();
      await this.page.keyboard.type(text);
      return;
    }
    
    // Method 3: Use the add block button
    const addBlockButton = this.page.locator('[aria-label="Add block"], .block-editor-inserter-button');
    if (await addBlockButton.first().isVisible()) {
      await addBlockButton.first().click();
      
      // Search for paragraph block
      const searchBox = this.page.locator('[placeholder*="Search"], input[type="search"]');
      if (await searchBox.isVisible()) {
        await searchBox.fill('paragraph');
      }
      
      // Click paragraph block
      const paragraphBlock = this.page.locator('[data-id="core/paragraph"], .block-editor-block-types-list__item:has-text("Paragraph")');
      if (await paragraphBlock.isVisible()) {
        await paragraphBlock.click();
      }
      
      await this.page.keyboard.type(text);
      return;
    }
    
    throw new Error('Could not find a way to add paragraph block');
  }

  /**
   * Select a specific block by index
   */
  async selectBlock(index: number = 0) {
    const blocks = this.page.locator('.wp-block-paragraph');
    await blocks.nth(index).click();
  }

  /**
   * Wait for WordPress editor to be ready
   */
  async waitForEditor() {
    // Wait for either the block editor or a clear indication we're on the wrong page
    try {
      await this.page.waitForSelector('.block-editor-writing-flow, .wp-editor-wrap', { timeout: 15000 });
    } catch (error) {
      // Check if we're on a login page or error page
      const isLoginPage = await this.page.locator('#loginform').isVisible().catch(() => false);
      if (isLoginPage) {
        throw new Error('Redirected to login page - authentication failed');
      }
      
      const currentUrl = this.page.url();
      throw new Error(`Editor not found. Current URL: ${currentUrl}. Original error: ${error.message}`);
    }
    
    // Try to wait for paragraph blocks but don't fail if none exist
    await this.page.waitForSelector('.wp-block-paragraph', { timeout: 3000 }).catch(() => {
      // It's okay if no paragraph blocks exist yet
    });
  }
}