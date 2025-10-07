import { Page } from '@playwright/test';

export class WordPressAuth {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(username: string = 'admin', password: string = 'password') {
    // Navigate to login page
    await this.page.goto('/wp-admin/');
    
    // Check if we're already logged in
    const isLoggedIn = await this.page.locator('body.wp-admin').isVisible().catch(() => false);
    if (isLoggedIn) {
      return;
    }

    // Wait for login form to appear
    await this.page.waitForSelector('#loginform, [role="main"]', { timeout: 10000 });

    // Check for modern login form (with "Username or Email Address" label)
    const modernUsernameField = this.page.locator('input[name="log"]');
    const modernPasswordField = this.page.locator('input[name="pwd"]');
    const loginButton = this.page.locator('#wp-submit, input[value="Log In"]');

    if (await modernUsernameField.isVisible()) {
      // Modern WordPress login form
      await modernUsernameField.clear();
      await modernUsernameField.fill(username);
      await modernPasswordField.clear();
      await modernPasswordField.fill(password);
      await loginButton.first().click();
    } else {
      // Classic WordPress login form
      const classicUsernameField = this.page.locator('#user_login');
      const classicPasswordField = this.page.locator('#user_pass');
      
      if (await classicUsernameField.isVisible()) {
        await classicUsernameField.clear();
        await classicUsernameField.fill(username);
        await classicPasswordField.clear();
        await classicPasswordField.fill(password);
        await this.page.click('#wp-submit');
      }
    }
    
    // Wait for successful login - either dashboard or any admin page
    await this.page.waitForFunction(() => {
      return (document.body && document.body.classList.contains('wp-admin')) || 
             (window.location.href.includes('/wp-admin/') && !window.location.href.includes('wp-login.php'));
    }, { timeout: 15000 });
  }

  async createNewPost() {
    await this.page.goto('/wp-admin/post-new.php');
    
    // Wait for page to load
    await this.page.waitForLoadState('domcontentloaded');
    
    // Check if we got redirected to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('wp-login.php')) {
      throw new Error('Not logged in - redirected to login page');
    }
    
    // Wait for editor to be present - check multiple possible selectors
    const editorSelectors = [
      '.block-editor-writing-flow',     // Modern block editor
      '.wp-block-post-title',           // Post title in block editor
      '.edit-post-layout',              // Block editor layout
      '#post-title-0',                  // Classic editor title
      '#post-body'                      // Classic editor body
    ];
    
    let editorFound = false;
    let isBlockEditor = false;
    
    // Try each selector with a reasonable timeout
    for (const selector of editorSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 3000 });
        editorFound = true;
        
        // Determine if it's block editor
        if (selector.includes('block-editor') || selector.includes('wp-block') || selector.includes('edit-post')) {
          isBlockEditor = true;
        }
        break;
      } catch (error) {
        // Try next selector
        continue;
      }
    }
    
    // If no editor selectors worked, try waiting for WordPress admin body
    if (!editorFound) {
      try {
        await this.page.waitForSelector('body.wp-admin', { timeout: 2000 });
        
        // Check for any signs this is a post editor
        const hasEditor = await this.page.locator('#post, .edit-post, .block-editor').count() > 0;
        if (hasEditor) {
          editorFound = true;
          // Default to block editor if we're not sure
          isBlockEditor = true;
        }
      } catch (error) {
        // Still no luck
      }
    }
    
    if (!editorFound) {
      throw new Error(`Editor not loaded. Current URL: ${currentUrl}`);
    }
    
    return isBlockEditor;
  }
}