import { Client } from '@notionhq/client';

interface NotionConfig {
  apiKey: string;
  databaseId?: string;
}

interface NotionPage {
  id: string;
  title: string;
  content: string;
  properties: Record<string, any>;
  createdTime: string;
  lastEditedTime: string;
}

interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
  pages: NotionPage[];
}

class NotionService {
  private client: Client;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.config = config;
    this.client = new Client({
      auth: config.apiKey,
    });
  }

  async getDatabases(): Promise<NotionDatabase[]> {
    try {
      const response = await this.client.search({
        filter: {
          property: 'object',
          value: 'database'
        }
      });

      return response.results.map((database: any) => ({
        id: database.id,
        title: database.title?.[0]?.plain_text || 'Untitled',
        properties: database.properties,
        pages: []
      }));
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw new Error('Failed to fetch Notion databases');
    }
  }

  async getDatabasePages(databaseId: string): Promise<NotionPage[]> {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
      });

      return response.results.map((page: any) => ({
        id: page.id,
        title: this.extractTitle(page.properties),
        content: '', // Content will be fetched separately if needed
        properties: page.properties,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      }));
    } catch (error) {
      console.error('Error fetching database pages:', error);
      throw new Error('Failed to fetch database pages');
    }
  }

  async getPageContent(pageId: string): Promise<string> {
    try {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
      });

      return response.results
        .map((block: any) => this.extractTextFromBlock(block))
        .filter(text => text.length > 0)
        .join('\n');
    } catch (error) {
      console.error('Error fetching page content:', error);
      throw new Error('Failed to fetch page content');
    }
  }

  async createPage(databaseId: string, properties: Record<string, any>, content?: string): Promise<NotionPage> {
    try {
      const response = await this.client.pages.create({
        parent: {
          database_id: databaseId,
        },
        properties,
      });

      if (content) {
        await this.client.blocks.children.append({
          block_id: response.id,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content,
                    },
                  },
                ],
              },
            },
          ],
        });
      }

      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        content: content || '',
        properties: response.properties,
        createdTime: response.created_time,
        lastEditedTime: response.last_edited_time,
      };
    } catch (error) {
      console.error('Error creating page:', error);
      throw new Error('Failed to create page');
    }
  }

  async updatePage(pageId: string, properties: Record<string, any>): Promise<NotionPage> {
    try {
      const response = await this.client.pages.update({
        page_id: pageId,
        properties,
      });

      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        content: '', // Content will need to be fetched separately
        properties: response.properties,
        createdTime: response.created_time,
        lastEditedTime: response.last_edited_time,
      };
    } catch (error) {
      console.error('Error updating page:', error);
      throw new Error('Failed to update page');
    }
  }

  async searchPages(query: string): Promise<NotionPage[]> {
    try {
      const response = await this.client.search({
        query,
        filter: {
          property: 'object',
          value: 'page'
        }
      });

      return response.results.map((page: any) => ({
        id: page.id,
        title: this.extractTitle(page.properties),
        content: '',
        properties: page.properties,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      }));
    } catch (error) {
      console.error('Error searching pages:', error);
      throw new Error('Failed to search pages');
    }
  }

  private extractTitle(properties: Record<string, any>): string {
    // Try to find title property
    const titleProperty = Object.values(properties).find((prop: any) => prop.type === 'title');
    if (titleProperty && titleProperty.title?.length > 0) {
      return titleProperty.title[0].plain_text;
    }

    // Try name property
    const nameProperty = properties.Name || properties.name;
    if (nameProperty && nameProperty.title?.length > 0) {
      return nameProperty.title[0].plain_text;
    }

    return 'Untitled';
  }

  private extractTextFromBlock(block: any): string {
    switch (block.type) {
      case 'paragraph':
        return block.paragraph.rich_text.map((text: any) => text.plain_text).join('');
      case 'heading_1':
        return block.heading_1.rich_text.map((text: any) => text.plain_text).join('');
      case 'heading_2':
        return block.heading_2.rich_text.map((text: any) => text.plain_text).join('');
      case 'heading_3':
        return block.heading_3.rich_text.map((text: any) => text.plain_text).join('');
      case 'bulleted_list_item':
        return '• ' + block.bulleted_list_item.rich_text.map((text: any) => text.plain_text).join('');
      case 'numbered_list_item':
        return '1. ' + block.numbered_list_item.rich_text.map((text: any) => text.plain_text).join('');
      case 'to_do':
        const checkbox = block.to_do.checked ? '[x]' : '[ ]';
        return checkbox + ' ' + block.to_do.rich_text.map((text: any) => text.plain_text).join('');
      case 'code':
        return '```\n' + block.code.rich_text.map((text: any) => text.plain_text).join('') + '\n```';
      default:
        return '';
    }
  }
}

// Create a default instance
export const createNotionService = (apiKey: string, databaseId?: string): NotionService => {
  return new NotionService({ apiKey, databaseId });
};

export default NotionService;
export type { NotionConfig, NotionPage, NotionDatabase };