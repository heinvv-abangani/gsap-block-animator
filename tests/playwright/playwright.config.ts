import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: false, // WordPress tests work better sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker for WordPress
  reporter: 'html',
  timeout: 60000, // Increased timeout for WordPress operations
  use: {
    // Use environment variable for CI, fallback to local development URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://elementor.local:10003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'wordpress-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // WordPress admin credentials - update these as needed
        storageState: undefined, // Will need to handle login in tests
      },
    },
  ],

  // Remove webServer config since WordPress is running via Local by Flywheel
});