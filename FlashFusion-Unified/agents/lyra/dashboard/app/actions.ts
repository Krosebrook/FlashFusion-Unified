'use server'

import { revalidatePath } from 'next/cache';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// Mock database functions - replace with actual database calls
interface Report {
  id: string;
  project_name: string;
  confidence?: number;
  recommendation?: string;
  dashboard_layout?: any;
  updated_at: string;
}

interface UserPreferences {
  user_id: string;
  onboarding_completed: boolean;
  dashboard_layout?: any;
}

// Action to rename a project
export async function renameProject(reportId: string, newName: string) {
  try {
    // Validate input
    if (!reportId || !newName?.trim()) {
      throw new Error('Invalid parameters');
    }

    // Mock database update - replace with actual Supabase call
    console.log(`Renaming project ${reportId} to ${newName}`);
    
    // In a real implementation, this would be:
    // const { error } = await supabase
    //   .from('reports')
    //   .update({ project_name: newName.trim(), updated_at: new Date().toISOString() })
    //   .eq('id', reportId);

    // Revalidate the page to reflect changes
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to rename project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Action to update dashboard layout
export async function updateDashboardLayout(reportId: string, layout: any[]) {
  try {
    if (!reportId || !Array.isArray(layout)) {
      throw new Error('Invalid parameters');
    }

    // Mock database update - replace with actual Supabase call
    console.log(`Updating dashboard layout for report ${reportId}`);
    
    // In a real implementation:
    // const { error } = await supabase
    //   .from('reports')
    //   .update({ 
    //     dashboard_layout: JSON.stringify(layout),
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', reportId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update dashboard layout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Action to mark onboarding as complete
export async function markOnboardingComplete(userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Mock database update - replace with actual Supabase call
    console.log(`Marking onboarding complete for user ${userId}`);
    
    // In a real implementation:
    // const { error } = await supabase
    //   .from('user_preferences')
    //   .upsert({ 
    //     user_id: userId,
    //     onboarding_completed: true,
    //     updated_at: new Date().toISOString()
    //   });

    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to mark onboarding complete:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Action to export report as PDF
export async function exportToPDF(reportId: string) {
  try {
    if (!reportId) {
      throw new Error('Report ID is required');
    }

    // Mock report data - replace with actual database fetch
    const reportData = {
      id: reportId,
      project_name: 'Sample Project',
      confidence: 85,
      recommendation: 'Proceed with development',
      analysis: 'Detailed analysis content...',
      market_estimation: {
        tam: 5000000000,
        sam: 500000000,
        som: 50000000
      },
      features: [
        { name: 'User Authentication', riceScore: 85 },
        { name: 'Dashboard', riceScore: 75 }
      ]
    };

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Create HTML content for PDF
    const htmlContent = generateReportHTML(reportData);
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    // Save PDF to exports directory
    const exportsDir = path.join(process.cwd(), 'public', 'exports');
    await fs.mkdir(exportsDir, { recursive: true });
    
    const filename = `${reportData.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
    const filepath = path.join(exportsDir, filename);
    
    await fs.writeFile(filepath, pdfBuffer);
    
    // Log export to database
    // In a real implementation:
    // await supabase.from('export_history').insert({
    //   report_id: reportId,
    //   export_type: 'pdf',
    //   filename,
    //   exported_at: new Date().toISOString()
    // });
    
    return { 
      success: true, 
      downloadUrl: `/exports/${filename}`,
      filename 
    };
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Action to export report as Markdown
export async function exportToMarkdown(reportId: string) {
  try {
    if (!reportId) {
      throw new Error('Report ID is required');
    }

    // Mock report data - replace with actual database fetch
    const reportData = {
      id: reportId,
      project_name: 'Sample Project',
      confidence: 85,
      recommendation: 'Proceed with development',
      analysis: 'Detailed analysis content...',
      market_estimation: {
        tam: 5000000000,
        sam: 500000000,
        som: 50000000
      },
      features: [
        { name: 'User Authentication', riceScore: 85 },
        { name: 'Dashboard', riceScore: 75 }
      ]
    };

    // Generate Markdown content
    const markdownContent = generateReportMarkdown(reportData);
    
    // Save Markdown to exports directory
    const exportsDir = path.join(process.cwd(), 'public', 'exports');
    await fs.mkdir(exportsDir, { recursive: true });
    
    const filename = `${reportData.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
    const filepath = path.join(exportsDir, filename);
    
    await fs.writeFile(filepath, markdownContent, 'utf-8');
    
    // Log export to database
    // In a real implementation:
    // await supabase.from('export_history').insert({
    //   report_id: reportId,
    //   export_type: 'markdown',
    //   filename,
    //   exported_at: new Date().toISOString()
    // });
    
    return { 
      success: true, 
      downloadUrl: `/exports/${filename}`,
      filename 
    };
  } catch (error) {
    console.error('Failed to export Markdown:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to generate HTML content for PDF
function generateReportHTML(reportData: any): string {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(1)}K`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${reportData.project_name} - Analysis Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .confidence-badge {
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          display: inline-block;
          margin: 10px 0;
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .market-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .market-item {
          text-align: center;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .market-value {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
        }
        .feature-list {
          list-style: none;
          padding: 0;
        }
        .feature-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          margin: 5px 0;
          background: #f8fafc;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${reportData.project_name}</h1>
        <div class="confidence-badge">${reportData.confidence}% Confidence</div>
        <p><strong>Recommendation:</strong> ${reportData.recommendation}</p>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <p>${reportData.analysis}</p>
      </div>

      <div class="section">
        <h2>Market Analysis</h2>
        <div class="market-grid">
          <div class="market-item">
            <div class="market-value">${formatCurrency(reportData.market_estimation.tam)}</div>
            <div>Total Addressable Market</div>
          </div>
          <div class="market-item">
            <div class="market-value">${formatCurrency(reportData.market_estimation.sam)}</div>
            <div>Serviceable Addressable Market</div>
          </div>
          <div class="market-item">
            <div class="market-value">${formatCurrency(reportData.market_estimation.som)}</div>
            <div>Serviceable Obtainable Market</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Feature Prioritization</h2>
        <ul class="feature-list">
          ${reportData.features.map((feature: any) => `
            <li class="feature-item">
              <span>${feature.name}</span>
              <span><strong>RICE Score: ${feature.riceScore}</strong></span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="footer">
        <p>Report generated on ${new Date().toLocaleDateString()}</p>
        <p>Generated by Vetting Vista AI Analysis Platform</p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate Markdown content
function generateReportMarkdown(reportData: any): string {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(1)}K`;
  };

  return `# ${reportData.project_name} - Analysis Report

## Overview
- **Confidence Level:** ${reportData.confidence}%
- **Recommendation:** ${reportData.recommendation}
- **Generated:** ${new Date().toLocaleDateString()}

## Executive Summary

${reportData.analysis}

## Market Analysis

### Market Size Estimation

| Market Type | Value |
|-------------|--------|
| Total Addressable Market (TAM) | ${formatCurrency(reportData.market_estimation.tam)} |
| Serviceable Addressable Market (SAM) | ${formatCurrency(reportData.market_estimation.sam)} |
| Serviceable Obtainable Market (SOM) | ${formatCurrency(reportData.market_estimation.som)} |

## Feature Prioritization

Based on RICE methodology (Reach × Impact × Confidence ÷ Effort):

${reportData.features.map((feature: any) => 
  `- **${feature.name}** - RICE Score: ${feature.riceScore}`
).join('\n')}

## Key Insights

1. Market opportunity shows strong potential with significant TAM
2. Feature prioritization indicates clear development roadmap
3. Confidence level suggests viable business opportunity

## Next Steps

1. Validate market assumptions through customer interviews
2. Begin development of highest-priority features
3. Establish go-to-market strategy
4. Monitor key metrics and adjust strategy as needed

---

*Report generated by Vetting Vista AI Analysis Platform*
`;
}

// Action to save market estimation
export async function saveMarketEstimation(reportId: string, estimation: any) {
  try {
    if (!reportId || !estimation) {
      throw new Error('Invalid parameters');
    }

    // Mock database update - replace with actual Supabase call
    console.log(`Saving market estimation for report ${reportId}`, estimation);
    
    // In a real implementation:
    // const { error } = await supabase
    //   .from('market_estimations')
    //   .upsert({
    //     report_id: reportId,
    //     tam: estimation.tam,
    //     sam: estimation.sam,
    //     som: estimation.som,
    //     description: estimation.marketDescription,
    //     assumptions: JSON.stringify(estimation.assumptions),
    //     confidence: estimation.confidence,
    //     sources: JSON.stringify(estimation.sources),
    //     created_at: new Date().toISOString()
    //   });

    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save market estimation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Action to save feature prioritization
export async function saveFeaturePrioritization(reportId: string, features: any[]) {
  try {
    if (!reportId || !Array.isArray(features)) {
      throw new Error('Invalid parameters');
    }

    // Mock database update - replace with actual Supabase call
    console.log(`Saving feature prioritization for report ${reportId}`, features);
    
    // In a real implementation:
    // const { error } = await supabase
    //   .from('feature_prioritization')
    //   .upsert({
    //     report_id: reportId,
    //     features: JSON.stringify(features),
    //     updated_at: new Date().toISOString()
    //   });

    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save feature prioritization:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}