'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Filter
} from 'lucide-react';

interface HistoricalDataPoint {
  date: string;
  confidence: number;
  recommendation: 'proceed' | 'caution' | 'stop';
  keyChanges: string[];
  marketConditions: 'favorable' | 'neutral' | 'unfavorable';
}

interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  significance: 'high' | 'medium' | 'low';
}

interface HistoricalAnalysisCardProps {
  reportId: string;
  onRefresh?: () => void;
}

export function HistoricalAnalysisCard({ reportId, onRefresh }: HistoricalAnalysisCardProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  useEffect(() => {
    loadHistoricalData();
  }, [reportId, timeRange]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    
    // Simulate loading historical data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock historical data
    const mockData: HistoricalDataPoint[] = [];
    const now = new Date();
    const daysBack = timeRange === '1m' ? 30 : timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
    
    for (let i = daysBack; i >= 0; i -= 7) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const confidence = Math.max(20, Math.min(95, 60 + Math.random() * 30 - 15));
      const recommendations: Array<'proceed' | 'caution' | 'stop'> = ['proceed', 'caution', 'stop'];
      const recommendation = confidence > 70 ? 'proceed' : confidence > 50 ? 'caution' : 'stop';
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        confidence: Math.round(confidence),
        recommendation,
        keyChanges: generateKeyChanges(),
        marketConditions: confidence > 65 ? 'favorable' : confidence > 45 ? 'neutral' : 'unfavorable'
      });
    }
    
    setHistoricalData(mockData);
    
    // Calculate trends
    const mockTrends: Trend[] = [
      {
        metric: 'Market Interest',
        direction: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.round(Math.random() * 20 + 5),
        significance: 'high'
      },
      {
        metric: 'Competition Level',
        direction: Math.random() > 0.3 ? 'up' : 'down',
        change: Math.round(Math.random() * 15 + 3),
        significance: 'medium'
      },
      {
        metric: 'Technology Readiness',
        direction: 'up',
        change: Math.round(Math.random() * 10 + 8),
        significance: 'high'
      },
      {
        metric: 'Regulatory Environment',
        direction: Math.random() > 0.6 ? 'up' : 'stable',
        change: Math.round(Math.random() * 8 + 2),
        significance: 'low'
      }
    ];
    
    setTrends(mockTrends);
    setIsLoading(false);
  };

  const generateKeyChanges = (): string[] => {
    const changes = [
      'Market size estimation updated',
      'New competitor analysis',
      'Technology stack refinement',
      'Regulatory changes identified',
      'Customer feedback integrated',
      'Business model adjustment',
      'Financial projections revised',
      'Risk assessment updated'
    ];
    
    return changes.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'proceed': return 'bg-green-100 text-green-800 border-green-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'stop': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const currentConfidence = historicalData.length > 0 ? historicalData[historicalData.length - 1].confidence : 0;
  const previousConfidence = historicalData.length > 1 ? historicalData[historicalData.length - 2].confidence : 0;
  const confidenceChange = currentConfidence - previousConfidence;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historical Analysis & Trends
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['1m', '3m', '6m', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Confidence Trend Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Confidence Score Over Time</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{currentConfidence}%</span>
              <div className={`flex items-center gap-1 text-sm ${
                confidenceChange > 0 ? 'text-green-600' : confidenceChange < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {confidenceChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : confidenceChange < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {Math.abs(confidenceChange)}%
              </div>
            </div>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Confidence']}
                />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Trends */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Trends
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, index) => (
              <motion.div
                key={trend.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{trend.metric}</span>
                  {getTrendIcon(trend.direction)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                    {trend.change}%
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getSignificanceColor(trend.significance)}`}
                  >
                    {trend.significance} impact
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Changes Timeline */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Analysis Updates
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {historicalData.slice(-5).reverse().map((point, index) => (
              <motion.div
                key={point.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {new Date(point.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{point.confidence}%</span>
                      <Badge className={getRecommendationColor(point.recommendation)}>
                        {point.recommendation}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {point.keyChanges.map((change, changeIndex) => (
                      <div key={changeIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>
                Your confidence score has {confidenceChange > 0 ? 'improved' : 'decreased'} by {Math.abs(confidenceChange)}% 
                over the selected time period, indicating {confidenceChange > 0 ? 'positive momentum' : 'areas needing attention'}.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>
                The analysis shows {trends.filter(t => t.direction === 'up').length} positive trends 
                and {trends.filter(t => t.direction === 'down').length} areas of concern.
              </p>
            </div>
            {trends.some(t => t.significance === 'high') && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>
                  High-impact changes detected in {trends.filter(t => t.significance === 'high').map(t => t.metric).join(', ')}. 
                  Consider reviewing your strategy accordingly.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}