import { test, expect, Page } from '@playwright/test';
import { WordPressAuth } from '../../utils/wp-auth';

async function fetchNonce( page: Page ): Promise<string> {
	await page.goto( '/wp-admin/post-new.php' );
	const pageText = await page.content();

	const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
	if ( ! nonceMatch ) {
		throw new Error( 'Nonce not found on the page' );
	}

	return nonceMatch[ 0 ].replace( /^.*"nonce":"([^"]*)".*$/, '$1' );
}

test.describe( 'GSAP Block Animator - Initial GSAP Creation and Saving', () => {
	test( 'should create page with paragraph and test GSAP controls', async ( { page } ) => {
		// Arrange
		const auth = new WordPressAuth( page );
		await auth.login( 'admin', 'password' );

		const nonce = await fetchNonce( page );

		const blockContent = `<!-- wp:paragraph --><p>Test paragraph for GSAP animation</p><!-- /wp:paragraph -->`;

		const request = page.context().request;
		const response = await request.post( '/index.php', {
			params: { rest_route: '/wp/v2/pages' },
			headers: {
				'X-WP-Nonce': nonce,
			},
			multipart: {
				title: 'GSAP Test Page',
				content: blockContent,
				status: 'draft',
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `Failed to create page: ${ response.status() }` );
		}

		const pageData = await response.json();
		const postId = pageData.id;

		// Act
		await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
		await page.waitForLoadState( 'domcontentloaded' );

		// Dismiss any welcome modal or overlay that might be blocking interactions
		try {
			// Wait for and dismiss the WordPress welcome modal if present
			await page.locator( '.components-modal__screen-overlay' ).waitFor( { timeout: 5000 } );
			await page.keyboard.press( 'Escape' );
			await page.waitForTimeout( 1000 );
		} catch ( error ) {
			// Modal not present, continue
		}

		// Try to close any other potential modals
		try {
			await page.locator( '[aria-label="Close"]' ).click( { timeout: 2000 } );
			await page.waitForTimeout( 1000 );
		} catch ( error ) {
			// No close button found, continue
		}

		const editorFrame = page.locator( 'iframe[name="editor-canvas"]' ).contentFrame();

		// Wait for the editor frame to be ready
		await editorFrame.waitForLoadState( 'domcontentloaded' );
		
		await editorFrame.getByText( 'Test paragraph for GSAP animation' ).click();

		await test.step( 'Configure GSAP animation settings', async () => {
			await page.getByRole( 'button', { name: 'GSAP Animation' } ).click();
			await page.getByRole( 'checkbox', { name: 'Enable Animation' } ).check();
			await page.getByRole( 'textbox', { name: 'X Movement' } ).fill( '100' );
			await page.getByRole( 'spinbutton', { name: 'Duration (seconds)' } ).fill( '3' );
			await page.getByRole( 'spinbutton', { name: 'Delay (seconds)' } ).fill( '1' );
		} );

		// Assert
		await test.step( 'Verify GSAP settings are correct', async () => {
			await expect( page.getByRole( 'checkbox', { name: 'Enable Animation' } ) ).toBeChecked();
			await expect( page.getByRole( 'textbox', { name: 'X Movement' } ) ).toHaveValue( '100' );
			await expect( page.getByRole( 'spinbutton', { name: 'Duration (seconds)' } ) ).toHaveValue( '3' );
			await expect( page.getByRole( 'spinbutton', { name: 'Delay (seconds)' } ) ).toHaveValue( '1' );
		} );

		await test.step( 'Save the page', async () => {
			await page.getByRole( 'button', { name: 'Save draft' } ).click();
			await page.waitForSelector( '.is-saved', { timeout: 10000 } );
			await page.waitForTimeout( 2000 );
		} );

		// Assert
		await test.step( 'Verify all control values persist after refresh', async () => {
			await page.reload();
			await page.waitForLoadState( 'domcontentloaded' );

			// Dismiss any welcome modal or overlay that might appear after refresh
			try {
				await page.locator( '.components-modal__screen-overlay' ).waitFor( { timeout: 5000 } );
				await page.keyboard.press( 'Escape' );
				await page.waitForTimeout( 1000 );
			} catch ( error ) {
				// Modal not present, continue
			}

			// Try to close any other potential modals
			try {
				await page.locator( '[aria-label="Close"]' ).click( { timeout: 2000 } );
				await page.waitForTimeout( 1000 );
			} catch ( error ) {
				// No close button found, continue
			}

			const editorFrameRefresh = page.locator( 'iframe[name="editor-canvas"]' ).contentFrame();
			await editorFrameRefresh.waitForLoadState( 'domcontentloaded' );
			await expect( editorFrameRefresh.getByText( 'Test paragraph for GSAP animation' ) ).toBeVisible();

			await editorFrameRefresh.getByText( 'Test paragraph for GSAP animation' ).click();

			if ( ! await page.getByRole( 'checkbox', { name: 'Enable Animation' } ).isVisible() ) {
				await page.getByRole( 'button', { name: 'GSAP Animation' } ).click();
			}

			await expect( page.getByRole( 'checkbox', { name: 'Enable Animation' } ) ).toBeChecked();
			await expect( page.getByRole( 'textbox', { name: 'X Movement' } ) ).toHaveValue( '100' );
			await expect( page.getByRole( 'spinbutton', { name: 'Duration (seconds)' } ) ).toHaveValue( '3' );
			await expect( page.getByRole( 'spinbutton', { name: 'Delay (seconds)' } ) ).toHaveValue( '1' );
		} );

		try {
			await request.delete( '/index.php', {
				params: {
					rest_route: `/wp/v2/pages/${ postId }`,
					force: true,
				},
				headers: {
					'X-WP-Nonce': nonce,
				},
			} );
		} catch ( error ) {
		}
	} );
} );
