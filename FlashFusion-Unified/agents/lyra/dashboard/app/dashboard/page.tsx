'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DraggableDashboard } from '@/components/enhanced/DraggableDashboard';
import { OnboardingTour } from '@/components/enhanced/OnboardingTour';
import { ProjectHeader } from '@/components/enhanced/ProjectHeader';
import { ThemeProvider } from '@/components/enhanced/DarkModeProvider';
import { MarketEstimationCard } from '@/components/features/MarketEstimationCard';
import { FeaturePrioritizationCard } from '@/components/features/FeaturePrioritizationCard';
import { HistoricalAnalysisCard } from '@/components/features/HistoricalAnalysisCard';
import { useToast } from '@/hooks/use-toast';
import { 
  renameProject, 
  updateDashboardLayout, 
  markOnboardingComplete,
  exportToPDF,
  exportToMarkdown
} from '@/app/actions';

export default function EnhancedDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserPreferences(preferences || {});
      setShowOnboarding(!preferences?.onboarding_completed);

      // Load mock reports data
      const mockReports = [
        {
          id: '1',
          project_name: 'AI-Powered Task Manager',
          confidence: 85,
          recommendation: 'Proceed with development - strong market opportunity identified',
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          evidence: [{ count: 12 }],
          market_estimations: [{
            tam: 5000000000,
            sam: 500000000,
            som: 50000000,
            description: 'Productivity software market shows strong growth potential'
          }],
          feature_prioritization: [{
            features: JSON.stringify([
              {
                id: '1',
                name: 'Smart Task Prioritization',
                description: 'AI-powered task ranking based on urgency and importance',
                reach: 9,
                impact: 8,
                confidence: 7,
                effort: 6,
                riceScore: 84,
                priority: 'high'
              },
              {
                id: '2',
                name: 'Team Collaboration',
                description: 'Real-time collaboration features for team productivity',
                reach: 7,
                impact: 8,
                confidence: 8,
                effort: 7,
                riceScore: 64,
                priority: 'medium'
              }
            ])
          }],
          export_history: []
        },
        {
          id: '2',
          project_name: 'E-commerce Analytics Platform',
          confidence: 72,
          recommendation: 'Proceed with caution - competitive market but good niche opportunity',
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          evidence: [{ count: 8 }],
          market_estimations: [{
            tam: 3000000000,
            sam: 300000000,
            som: 30000000,
            description: 'E-commerce analytics market with focus on SMBs'
          }],
          feature_prioritization: [{
            features: JSON.stringify([
              {
                id: '1',
                name: 'Real-time Dashboard',
                description: 'Live analytics dashboard for e-commerce metrics',
                reach: 8,
                impact: 9,
                confidence: 8,
                effort: 8,
                riceScore: 72,
                priority: 'high'
              }
            ])
          }],
          export_history: []
        }
      ];

      setReports(mockReports);
      if (mockReports.length > 0) {
        setSelectedReport(mockReports[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (newName: string) => {
    if (!selectedReport) return;
    
    try {
      await renameProject(selectedReport.id, newName);
      setSelectedReport(prev => ({ ...prev, project_name: newName }));
      setReports(prev => prev.map(r => 
        r.id === selectedReport.id ? { ...r, project_name: newName } : r
      ));
      toast({
        title: 'Success',
        description: 'Project renamed successfully.'
      });
    } catch (error) {
      toast({
        title: 'Rename Failed',
        description: 'Failed to rename project.',
        variant: 'destructive'
      });
    }
  };

  const handleLayoutChange = async (layout: any[]) => {
    if (!selectedReport) return;
    
    try {
      await updateDashboardLayout(selectedReport.id, layout);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await markOnboardingComplete(user.id);
      }
      setShowOnboarding(false);
      toast({
        title: 'Welcome!',
        description: 'You\'re all set to start analyzing your projects.',
      });
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
    }
  };

  const handleExport = async (format: 'pdf' | 'markdown') => {
    if (!selectedReport) return;

    try {
      const result = format === 'pdf' 
        ? await exportToPDF(selectedReport.id)
        : await exportToMarkdown(selectedReport.id);

      if (result.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Complete',
          description: `Report exported as ${format.toUpperCase()}.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: `Failed to export report as ${format.toUpperCase()}.`,
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (!selectedReport) return;

    const shareUrl = `${window.location.origin}/report/${selectedReport.id}/share`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied',
        description: 'Shareable link copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: 'Failed to copy share link.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultDashboardCards = selectedReport ? [
    {
      id: 'ai-analysis',
      type: 'analysis' as const,
      title: 'AI Analysis',
      content: (
        <div className="space-y-4 analysis-card">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Recommendation</h4>
            <p>{selectedReport.recommendation || 'No recommendation yet'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              {selectedReport.confidence || 0}%
            </div>
            <span className="text-muted-foreground">Confidence</span>
          </div>
        </div>
      )
    },
    {
      id: 'market-estimation',
      type: 'market-estimation' as const,
      title: 'Market Estimation',
      content: (
        <MarketEstimationCard 
          reportId={selectedReport.id}
          existingEstimation={selectedReport.market_estimations?.[0] ? {
            tam: selectedReport.market_estimations[0].tam,
            sam: selectedReport.market_estimations[0].sam,
            som: selectedReport.market_estimations[0].som,
            marketDescription: selectedReport.market_estimations[0].description,
            assumptions: ['Market growth rate of 15% annually', 'Customer acquisition cost of $50'],
            confidence: 85,
            sources: ['Industry Research', 'Competitor Analysis'],
            calculatedAt: new Date()
          } : null}
        />
      )
    },
    {
      id: 'feature-prioritization',
      type: 'feature-priority' as const,
      title: 'Feature Prioritization',
      content: (
        <FeaturePrioritizationCard 
          reportId={selectedReport.id}
          existingPrioritization={selectedReport.feature_prioritization?.[0]?.features ? 
            JSON.parse(selectedReport.feature_prioritization[0].features) : null}
        />
      )
    },
    {
      id: 'historical-analysis',
      type: 'analysis' as const,
      title: 'Historical Analysis',
      content: <HistoricalAnalysisCard reportId={selectedReport.id} />
    }
  ] : [];

  return (
    <ThemeProvider defaultTheme="system" storageKey="vetting-vista-theme">
      <div className="min-h-screen bg-background dashboard-container">
        {/* Onboarding Tour */}
        <OnboardingTour
          isVisible={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />

        {/* Project Header */}
        {selectedReport && (
          <ProjectHeader
            projectName={selectedReport.project_name}
            confidence={selectedReport.confidence}
            recommendation={selectedReport.recommendation}
            lastUpdated={new Date(selectedReport.updated_at)}
            onRename={handleRename}
            onExport={handleExport}
            onShare={handleShare}
          />
        )}

        <div className="container mx-auto p-6">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Welcome to Vetting Vista</h2>
              <p className="text-muted-foreground mb-8">
                Create your first project to start analyzing business opportunities with AI.
              </p>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg">
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <h3 className="font-semibold">Your Projects</h3>
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors card-hover ${
                          selectedReport?.id === report.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="font-medium">{report.project_name}</div>
                        <div className="text-xs opacity-75">
                          {report.confidence ? `${report.confidence}% confidence` : 'Not analyzed'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Dashboard */}
              <div className="lg:col-span-3">
                {selectedReport ? (
                  <div className="dashboard-cards">
                    <DraggableDashboard
                      reportId={selectedReport.id}
                      initialLayout={defaultDashboardCards}
                      onLayoutChange={handleLayoutChange}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">Select a project to view its dashboard</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}