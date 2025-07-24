#!/usr/bin/env node

/**
 * FlashFusion Interview Script Generator
 * Generates customized interview scripts based on research framework and target audience
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

class InterviewScriptGenerator {
    constructor() {
        this.frameworks = {
            'heart': 'Google HEART Framework (Happiness, Engagement, Adoption, Retention, Task Success)',
            'jtbd': 'Jobs to Be Done Framework',
            'design_thinking': 'Design Thinking Framework',
            'behavioral': 'Behavioral Research Framework',
            'mental_models': 'Mental Models Framework',
            'user_journey': 'User Journey Mapping Framework'
        };

        this.audiences = {
            'ai_developers': 'AI Developers & Automation Specialists',
            'ecommerce_sellers': 'E-commerce Sellers & Entrepreneurs', 
            'content_creators': 'Content Creators & Digital Marketers'
        };

        this.scriptTemplates = this.initializeScriptTemplates();
    }

    initializeScriptTemplates() {
        return {
            ai_developers: {
                jtbd: {
                    title: 'AI Development Workflow Research',
                    duration: '45 minutes',
                    introduction: 'Understanding how developers work with AI services and automation',
                    questions: [
                        {
                            section: 'Context Setting',
                            questions: [
                                'Tell me about your role and how long you\'ve been working with AI/ML.',
                                'What types of AI-powered applications do you typically build?',
                                'How many different AI services or APIs do you usually integrate?'
                            ]
                        },
                        {
                            section: 'Current Workflow Deep Dive',
                            questions: [
                                'Walk me through your last AI project from conception to deployment.',
                                'When you need to integrate multiple AI services, what\'s your process?',
                                'Where do you typically get stuck or spend unexpected time?',
                                'Can you show me (screen share) how you currently manage API keys and configurations?'
                            ]
                        },
                        {
                            section: 'Pain Points & Frustrations',
                            questions: [
                                'What\'s the most frustrating part of working with multiple AI APIs?',
                                'Tell me about a time when AI integration took much longer than expected.',
                                'How do you handle errors and debugging across different AI services?',
                                'What manual tasks do you do repeatedly that you wish were automated?'
                            ]
                        },
                        {
                            section: 'Jobs to Be Done',
                            questions: [
                                'When you\'re starting a new AI project, what job are you trying to get done?',
                                'What would success look like for your ideal AI development workflow?',
                                'If you had a magic wand, what would you automate first?',
                                'How do you measure the success of an AI integration project?'
                            ]
                        },
                        {
                            section: 'Solution Exploration',
                            questions: [
                                'Have you tried any AI orchestration or workflow tools? What was your experience?',
                                'What would make you 10x more productive in AI development?',
                                'If there was a tool that could orchestrate AI agents for you, what would it need to do?',
                                'How much time per week would you save with perfect AI automation?'
                            ]
                        }
                    ]
                },
                behavioral: {
                    title: 'AI Developer Behavioral Analysis',
                    duration: '60 minutes',
                    introduction: 'Observing actual AI development workflows and pain points',
                    questions: [
                        {
                            section: 'Workflow Observation',
                            questions: [
                                'Can you show me how you typically start a new AI integration?',
                                'Walk me through setting up API connections for a multi-service project.',
                                'Show me how you handle authentication and API key management.',
                                'Demonstrate your debugging process when an AI service fails.'
                            ]
                        },
                        {
                            section: 'Tool Usage Analysis',
                            questions: [
                                'What tools do you have open right now for AI development?',
                                'How often do you switch between different interfaces or dashboards?',
                                'Show me how you monitor the performance of AI services.',
                                'What documentation do you reference most frequently?'
                            ]
                        },
                        {
                            section: 'Time Tracking Exercise',
                            questions: [
                                'Let\'s time how long it takes to set up a new AI service integration.',
                                'Can you estimate time spent on each step of your workflow?',
                                'What percentage of your time is spent on actual coding vs. configuration?',
                                'How much time do you spend debugging vs. building features?'
                            ]
                        }
                    ]
                }
            },
            ecommerce_sellers: {
                user_journey: {
                    title: 'Multi-Platform E-commerce Management Journey',
                    duration: '50 minutes',
                    introduction: 'Understanding the complete journey of managing multiple selling platforms',
                    questions: [
                        {
                            section: 'Platform Overview',
                            questions: [
                                'Which platforms do you currently sell on? (Shopify, Amazon, eBay, Etsy, etc.)',
                                'How long have you been selling on multiple platforms?',
                                'What\'s your monthly revenue across all platforms?',
                                'How many products do you typically manage?'
                            ]
                        },
                        {
                            section: 'Product Listing Journey',
                            questions: [
                                'Walk me through adding a new product across all your platforms.',
                                'How do you adapt product descriptions for different platforms?',
                                'What\'s your process for product photography and image management?',
                                'How do you handle platform-specific requirements (categories, attributes, etc.)?'
                            ]
                        },
                        {
                            section: 'Inventory Management Journey',
                            questions: [
                                'How do you currently sync inventory across platforms?',
                                'Tell me about a time when inventory got out of sync. What happened?',
                                'How do you handle stock updates when you get low on inventory?',
                                'What\'s your biggest fear with inventory management?'
                            ]
                        },
                        {
                            section: 'Customer Service Journey',
                            questions: [
                                'How do you manage customer inquiries across different platforms?',
                                'What are the most common questions you receive?',
                                'How do you handle returns and refunds on different platforms?',
                                'What percentage of your time is spent on customer service?'
                            ]
                        },
                        {
                            section: 'Analytics & Optimization Journey',
                            questions: [
                                'How do you track performance across all your platforms?',
                                'What metrics matter most to your business?',
                                'How do you identify which products to promote or discontinue?',
                                'What would perfect cross-platform analytics look like?'
                            ]
                        }
                    ]
                }
            },
            content_creators: {
                mental_models: {
                    title: 'Content Creation and Repurposing Mental Models',
                    duration: '45 minutes',
                    introduction: 'Understanding how creators think about multi-platform content strategy',
                    questions: [
                        {
                            section: 'Content Strategy Mental Model',
                            questions: [
                                'How do you decide what content to create each week?',
                                'Walk me through your content planning process.',
                                'How do you think about adapting content for different platforms?',
                                'What\'s your mental framework for content that performs well?'
                            ]
                        },
                        {
                            section: 'Platform Adaptation Mental Model',
                            questions: [
                                'When you have a blog post, how do you decide what to do with it next?',
                                'How do you think about the differences between platforms?',
                                'What\'s your process for adapting long-form content to short-form?',
                                'How do you maintain your brand voice across different formats?'
                            ]
                        },
                        {
                            section: 'Workflow Mental Model',
                            questions: [
                                'Describe your ideal content creation workflow from start to finish.',
                                'How do you think about the relationship between content creation and distribution?',
                                'What would perfect content repurposing look like in your mind?',
                                'If you could automate one part of your content workflow, what would it be?'
                            ]
                        },
                        {
                            section: 'Success Mental Model',
                            questions: [
                                'How do you define successful content?',
                                'What metrics matter most to you across different platforms?',
                                'How do you think about the ROI of content repurposing?',
                                'What would 10x better content productivity look like?'
                            ]
                        }
                    ]
                }
            }
        };
    }

    generateScript(audience, framework, customization = {}) {
        const template = this.scriptTemplates[audience]?.[framework];
        if (!template) {
            throw new Error(`No template found for audience: ${audience}, framework: ${framework}`);
        }

        const script = {
            metadata: {
                title: customization.title || template.title,
                audience: this.audiences[audience],
                framework: this.frameworks[framework],
                duration: customization.duration || template.duration,
                generatedAt: new Date().toISOString(),
                version: '1.0'
            },
            introduction: {
                welcome: 'Hi [Name], thank you so much for taking the time to talk with me today.',
                purpose: customization.introduction || template.introduction,
                logistics: `This should take about ${template.duration}. I\'ll be recording this session for analysis - is that okay with you?`,
                consent: 'Before we start, do you have any questions about this research or how we\'ll use the information?'
            },
            sections: template.questions,
            closing: {
                gratitude: 'This has been incredibly valuable. Thank you for sharing your insights.',
                nextSteps: 'We\'ll be analyzing all the feedback we receive and may follow up with additional questions.',
                compensation: 'You should receive your [incentive] within 3-5 business days.',
                contact: 'If you have any questions after this call, feel free to reach out to [email].'
            },
            moderatorNotes: {
                preparation: [
                    'Review participant\'s background and screening responses',
                    'Prepare follow-up questions based on their specific context',
                    'Test recording equipment and backup recording method',
                    'Have consent form ready if not already signed'
                ],
                duringInterview: [
                    'Listen for emotional language and probe deeper',
                    'Ask for specific examples and stories',
                    'Watch for non-verbal cues and body language',
                    'Keep track of time but prioritize valuable insights'
                ],
                followUp: [
                    'Send thank you email within 24 hours',
                    'Upload and transcribe recording immediately',
                    'Note key insights while memory is fresh',
                    'Schedule analysis session within 48 hours'
                ]
            }
        };

        return script;
    }

    async saveScript(script, filename) {
        const scriptsDir = path.join(__dirname, '../../docs/research-scripts');
        await fs.mkdir(scriptsDir, { recursive: true });
        
        const filepath = path.join(scriptsDir, `${filename}.json`);
        await fs.writeFile(filepath, JSON.stringify(script, null, 2));
        
        // Also create a human-readable markdown version
        const markdownScript = this.convertToMarkdown(script);
        const markdownPath = path.join(scriptsDir, `${filename}.md`);
        await fs.writeFile(markdownPath, markdownScript);
        
        return { jsonPath: filepath, markdownPath };
    }

    convertToMarkdown(script) {
        let markdown = `# ${script.metadata.title}\n\n`;
        markdown += `**Audience**: ${script.metadata.audience}\n`;
        markdown += `**Framework**: ${script.metadata.framework}\n`;
        markdown += `**Duration**: ${script.metadata.duration}\n`;
        markdown += `**Generated**: ${script.metadata.generatedAt}\n\n`;

        markdown += `## Introduction\n\n`;
        markdown += `**Welcome**: ${script.introduction.welcome}\n\n`;
        markdown += `**Purpose**: ${script.introduction.purpose}\n\n`;
        markdown += `**Logistics**: ${script.introduction.logistics}\n\n`;
        markdown += `**Consent**: ${script.introduction.consent}\n\n`;

        markdown += `## Interview Sections\n\n`;
        script.sections.forEach((section, index) => {
            markdown += `### ${index + 1}. ${section.section}\n\n`;
            section.questions.forEach((question, qIndex) => {
                markdown += `${qIndex + 1}. ${question}\n`;
            });
            markdown += `\n`;
        });

        markdown += `## Closing\n\n`;
        markdown += `**Gratitude**: ${script.closing.gratitude}\n\n`;
        markdown += `**Next Steps**: ${script.closing.nextSteps}\n\n`;
        markdown += `**Compensation**: ${script.closing.compensation}\n\n`;
        markdown += `**Contact**: ${script.closing.contact}\n\n`;

        markdown += `## Moderator Notes\n\n`;
        markdown += `### Preparation\n`;
        script.moderatorNotes.preparation.forEach(note => {
            markdown += `- ${note}\n`;
        });
        markdown += `\n### During Interview\n`;
        script.moderatorNotes.duringInterview.forEach(note => {
            markdown += `- ${note}\n`;
        });
        markdown += `\n### Follow Up\n`;
        script.moderatorNotes.followUp.forEach(note => {
            markdown += `- ${note}\n`;
        });

        return markdown;
    }

    listAvailableTemplates() {
        const templates = {};
        Object.keys(this.scriptTemplates).forEach(audience => {
            templates[audience] = Object.keys(this.scriptTemplates[audience]);
        });
        return templates;
    }
}

// CLI Interface
program
    .name('interview-generator')
    .description('Generate customized interview scripts for user research')
    .version('1.0.0');

program
    .command('generate')
    .description('Generate an interview script')
    .requiredOption('-a, --audience <type>', 'Target audience (ai_developers, ecommerce_sellers, content_creators)')
    .requiredOption('-f, --framework <type>', 'Research framework (jtbd, behavioral, mental_models, user_journey)')
    .option('-t, --title <title>', 'Custom title for the interview')
    .option('-d, --duration <duration>', 'Interview duration (e.g. "45 minutes")')
    .option('-o, --output <filename>', 'Output filename (without extension)')
    .action(async (options) => {
        const generator = new InterviewScriptGenerator();
        
        try {
            const script = generator.generateScript(
                options.audience, 
                options.framework,
                {
                    title: options.title,
                    duration: options.duration
                }
            );
            
            const filename = options.output || `${options.audience}_${options.framework}_${Date.now()}`;
            const paths = await generator.saveScript(script, filename);
            
            console.log('✅ Interview script generated successfully!');
            console.log(`📄 JSON: ${paths.jsonPath}`);
            console.log(`📝 Markdown: ${paths.markdownPath}`);
            
        } catch (error) {
            console.error('❌ Error generating script:', error.message);
            process.exit(1);
        }
    });

program
    .command('list')
    .description('List available templates')
    .action(() => {
        const generator = new InterviewScriptGenerator();
        const templates = generator.listAvailableTemplates();
        
        console.log('📋 Available Templates:\n');
        Object.entries(templates).forEach(([audience, frameworks]) => {
            console.log(`👥 ${audience}:`);
            frameworks.forEach(framework => {
                console.log(`   - ${framework}`);
            });
            console.log('');
        });
    });

// Export for use as module
module.exports = { InterviewScriptGenerator };

// Run CLI if called directly
if (require.main === module) {
    program.parse();
}