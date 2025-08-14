#!/usr/bin/env node

/**
 * Notion Sync Script for FlashFusion
 * Syncs project updates, commits, and documentation to Notion
 */

require('dotenv').config();
const NotionService = require('../src/services/notionService');
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class NotionProjectSync {
    constructor() {
        this.notionService = new NotionService();
        this.projectDatabaseId = process.env.NOTION_PROJECT_DB_ID;
        this.updatesDatabaseId = process.env.NOTION_UPDATES_DB_ID;
    }

    async init() {
        console.log('🔄 FlashFusion Notion Sync\n');
        
        const initialized = await this.notionService.initialize();
        if (!initialized) {
            console.error('❌ Failed to initialize Notion service. Check NOTION_TOKEN in .env');
            return;
        }

        const action = await this.selectAction();
        
        switch (action) {
            case '1':
                await this.syncLatestCommits();
                break;
            case '2':
                await this.createProjectUpdate();
                break;
            case '3':
                await this.syncDocumentation();
                break;
            case '4':
                await this.createSetupGuide();
                break;
            default:
                console.log('Invalid option');
        }
    }

    async selectAction() {
        console.log('What would you like to sync?');
        console.log('1. Latest Git commits');
        console.log('2. Create project update');
        console.log('3. Sync documentation');
        console.log('4. Create Notion setup guide');
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            readline.question('\nSelect option (1-4): ', (answer) => {
                readline.close();
                resolve(answer);
            });
        });
    }

    async syncLatestCommits() {
        try {
            console.log('\n📊 Syncing latest commits to Notion...\n');
            
            // Get latest commits
            const commits = this.getRecentCommits(5);
            
            // Create a page for today's updates
            const today = new Date().toISOString().split('T')[0];
            const pageTitle = `FlashFusion Updates - ${today}`;
            
            const response = await this.notionService.createPage({
                parent: { database_id: this.updatesDatabaseId || this.projectDatabaseId },
                icon: { emoji: '🚀' },
                properties: {
                    title: { 
                        title: [{ text: { content: pageTitle } }] 
                    },
                    Status: { 
                        select: { name: 'In Progress' } 
                    },
                    Date: { 
                        date: { start: today } 
                    }
                },
                children: [
                    {
                        object: 'block',
                        type: 'heading_2',
                        heading_2: {
                            rich_text: [{ text: { content: '📝 Recent Commits' } }]
                        }
                    },
                    ...commits.map(commit => ({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: [{
                                text: {
                                    content: `${commit.hash} - ${commit.message} (${commit.date})`
                                }
                            }]
                        }
                    })),
                    {
                        object: 'block',
                        type: 'heading_2',
                        heading_2: {
                            rich_text: [{ text: { content: '🔧 Recent Changes' } }]
                        }
                    },
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{
                                text: {
                                    content: this.getRecentChangeSummary()
                                }
                            }]
                        }
                    }
                ]
            });

            console.log('✅ Commits synced to Notion successfully!');
            console.log(`📄 Page created: ${pageTitle}`);
            
        } catch (error) {
            console.error('❌ Failed to sync commits:', error.message);
        }
    }

    async createProjectUpdate() {
        try {
            console.log('\n📝 Creating project update in Notion...\n');
            
            const updates = {
                'MCP Integration': {
                    status: 'Completed',
                    description: 'Integrated 7 Model Context Protocol servers for enhanced AI capabilities'
                },
                'Security Improvements': {
                    status: 'Completed',
                    description: 'Implemented key rotation system, ESLint security rules, and documentation'
                },
                'Dependency Cleanup': {
                    status: 'Completed',
                    description: 'Removed 266 extraneous packages, fixed vulnerabilities'
                },
                'Vercel Deployment': {
                    status: 'Ready',
                    description: 'Fixed Winston logger issues, ready for deployment'
                }
            };

            const response = await this.notionService.createPage({
                parent: { database_id: this.projectDatabaseId },
                icon: { emoji: '📊' },
                properties: {
                    title: { 
                        title: [{ text: { content: 'FlashFusion Major Update - MCP & Security' } }] 
                    }
                },
                children: [
                    {
                        object: 'block',
                        type: 'heading_1',
                        heading_1: {
                            rich_text: [{ text: { content: '🚀 FlashFusion Platform Update' } }]
                        }
                    },
                    {
                        object: 'block',
                        type: 'callout',
                        callout: {
                            icon: { emoji: '✅' },
                            rich_text: [{
                                text: {
                                    content: 'Major improvements to security, AI capabilities, and deployment readiness'
                                }
                            }]
                        }
                    },
                    ...Object.entries(updates).flatMap(([feature, details]) => [
                        {
                            object: 'block',
                            type: 'heading_2',
                            heading_2: {
                                rich_text: [{ text: { content: feature } }]
                            }
                        },
                        {
                            object: 'block',
                            type: 'paragraph',
                            paragraph: {
                                rich_text: [
                                    { text: { content: 'Status: ' }, annotations: { bold: true } },
                                    { text: { content: details.status } },
                                    { text: { content: '\n' } },
                                    { text: { content: details.description } }
                                ]
                            }
                        }
                    ])
                ]
            });

            console.log('✅ Project update created in Notion!');
            
        } catch (error) {
            console.error('❌ Failed to create update:', error.message);
        }
    }

    async syncDocumentation() {
        try {
            console.log('\n📚 Syncing documentation to Notion...\n');
            
            const docs = [
                { file: 'README.md', title: 'FlashFusion README' },
                { file: 'SECURITY.md', title: 'Security Guidelines' },
                { file: 'docs/MCP_INTEGRATION.md', title: 'MCP Integration Guide' },
                { file: 'docs/KEY_ROTATION_GUIDE.md', title: 'Key Rotation Guide' }
            ];

            for (const doc of docs) {
                const filePath = path.join(__dirname, '..', doc.file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    
                    // Create page for each document
                    await this.notionService.createPage({
                        parent: { database_id: this.projectDatabaseId },
                        icon: { emoji: '📄' },
                        properties: {
                            title: { 
                                title: [{ text: { content: doc.title } }] 
                            }
                        },
                        children: this.markdownToNotionBlocks(content)
                    });
                    
                    console.log(`✅ Synced: ${doc.title}`);
                } catch (error) {
                    console.log(`⚠️  Skipped: ${doc.file} (${error.message})`);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to sync documentation:', error.message);
        }
    }

    async createSetupGuide() {
        console.log('\n📋 Creating Notion databases for FlashFusion...\n');
        
        // Create databases programmatically
        console.log('To set up Notion integration:');
        console.log('1. Create a new Notion integration at https://www.notion.so/my-integrations');
        console.log('2. Copy the integration token to NOTION_TOKEN in .env');
        console.log('3. Create two databases in Notion:');
        console.log('   - "FlashFusion Project" (main project tracking)');
        console.log('   - "FlashFusion Updates" (daily updates)');
        console.log('4. Share both databases with your integration');
        console.log('5. Copy database IDs to .env:');
        console.log('   - NOTION_PROJECT_DB_ID=your_project_db_id');
        console.log('   - NOTION_UPDATES_DB_ID=your_updates_db_id');
        console.log('\nDatabase IDs can be found in the database URL after the workspace name');
    }

    getRecentCommits(count = 5) {
        try {
            const gitLog = execSync(`git log --oneline -${count} --pretty=format:"%h|%s|%ad" --date=short`)
                .toString()
                .trim()
                .split('\n');
            
            return gitLog.map(line => {
                const [hash, message, date] = line.split('|');
                return { hash, message, date };
            });
        } catch (error) {
            return [];
        }
    }

    getRecentChangeSummary() {
        const changes = [
            '✅ Added MCP (Model Context Protocol) integration with 7 servers',
            '✅ Implemented comprehensive key rotation system',
            '✅ Fixed Vercel deployment issues (Winston logger)',
            '✅ Cleaned up 266 extraneous npm packages',
            '✅ Added ESLint with security-focused configuration',
            '✅ Created security documentation and guidelines',
            '✅ Converted mcp-servers to proper git submodule'
        ];
        
        return changes.join('\n');
    }

    markdownToNotionBlocks(markdown) {
        // Simple markdown to Notion blocks converter
        const lines = markdown.split('\n');
        const blocks = [];
        
        for (const line of lines) {
            if (line.startsWith('# ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_1',
                    heading_1: {
                        rich_text: [{ text: { content: line.substring(2) } }]
                    }
                });
            } else if (line.startsWith('## ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ text: { content: line.substring(3) } }]
                    }
                });
            } else if (line.startsWith('- ')) {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{ text: { content: line.substring(2) } }]
                    }
                });
            } else if (line.trim()) {
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ text: { content: line } }]
                    }
                });
            }
        }
        
        return blocks.slice(0, 100); // Notion has a limit on blocks per request
    }
}

// Run the sync
const sync = new NotionProjectSync();
sync.init().catch(console.error);