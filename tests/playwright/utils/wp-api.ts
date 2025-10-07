import { Page } from '@playwright/test';

export class WordPressAPI {
  private page: Page;
  private baseURL: string;

  constructor(page: Page, baseURL: string = 'http://elementor.local') {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * Create a post via WordPress REST API
   */
  async createPost(options: {
    title?: string;
    content?: string;
    status?: 'draft' | 'publish';
    type?: 'post' | 'page';
  }) {
    const { 
      title = 'Test Post',
      content = '',
      status = 'draft',
      type = 'post'
    } = options;

    // Create post via REST API
    const response = await this.page.request.post(`${this.baseURL}/wp-json/wp/v2/${type}s`, {
      data: {
        title,
        content,
        status
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok()) {
      throw new Error(`Failed to create ${type}: ${response.status()} ${response.statusText()}`);
    }

    const postData = await response.json();
    return postData;
  }

  /**
   * Create a post with Gutenberg blocks
   */
  async createPostWithBlocks(options: {
    title?: string;
    blocks: Array<{
      blockName: string;
      attrs?: Record<string, any>;
      innerContent?: string[];
    }>;
    status?: 'draft' | 'publish';
    type?: 'post' | 'page';
  }) {
    const { 
      title = 'Test Post with Blocks',
      blocks,
      status = 'draft',
      type = 'post'
    } = options;

    // Convert blocks to Gutenberg block content
    const content = blocks.map(block => {
      const { blockName, attrs = {}, innerContent = [''] } = block;
      
      // Create block comment format
      const attrsString = Object.keys(attrs).length > 0 ? ` ${JSON.stringify(attrs)}` : '';
      const blockStart = `<!-- wp:${blockName}${attrsString} -->`;
      const blockEnd = `<!-- /wp:${blockName} -->`;
      
      return `${blockStart}\n${innerContent.join('\n')}\n${blockEnd}`;
    }).join('\n\n');

    return await this.createPost({
      title,
      content,
      status,
      type
    });
  }

  /**
   * Create a simple paragraph post
   */
  async createParagraphPost(options: {
    title?: string;
    paragraphText?: string;
    gsapConfig?: Record<string, any>;
  }) {
    const { 
      title = 'Test GSAP Paragraph',
      paragraphText = 'This is a test paragraph for GSAP animation',
      gsapConfig = {}
    } = options;

    const blocks = [{
      blockName: 'core/paragraph',
      attrs: {
        ...(Object.keys(gsapConfig).length > 0 && { gsapAnimation: gsapConfig })
      },
      innerContent: [`<p>${paragraphText}</p>`]
    }];

    return await this.createPostWithBlocks({
      title,
      blocks,
      status: 'draft',
      type: 'post'
    });
  }

  /**
   * Navigate to edit a post
   */
  async editPost(postId: number) {
    await this.page.goto(`${this.baseURL}/wp-admin/post.php?post=${postId}&action=edit`);
    
    // Wait for editor to load
    await this.page.waitForSelector('body.block-editor-page', { timeout: 15000 });
  }

  /**
   * Delete a post
   */
  async deletePost(postId: number, type: 'post' | 'page' = 'post') {
    const response = await this.page.request.delete(`${this.baseURL}/wp-json/wp/v2/${type}s/${postId}`, {
      data: { force: true }
    });
    
    return response.ok();
  }
}