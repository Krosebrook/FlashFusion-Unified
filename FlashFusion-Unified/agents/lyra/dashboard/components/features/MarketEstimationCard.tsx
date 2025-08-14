'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface MarketEstimation {
  tam: number; // Total Addressable Market
  sam: number; // Serviceable Addressable Market
  som: number; // Serviceable Obtainable Market
  marketDescription: string;
  assumptions: string[];
  confidence: number;
  sources: string[];
  calculatedAt: Date;
}

interface MarketEstimationCardProps {
  reportId: string;
  existingEstimation?: MarketEstimation | null;
  onUpdate?: (estimation: MarketEstimation) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function MarketEstimationCard({ 
  reportId, 
  existingEstimation, 
  onUpdate 
}: MarketEstimationCardProps) {
  const [estimation, setEstimation] = useState<MarketEstimation | null>(existingEstimation || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showForm, setShowForm] = useState(!existingEstimation);

  // Form state
  const [formData, setFormData] = useState({
    marketDescription: '',
    targetAudience: '',
    competitorAnalysis: '',
    pricingModel: '',
    assumptions: ['']
  });

  useEffect(() => {
    if (existingEstimation) {
      setEstimation(existingEstimation);
      setShowForm(false);
    }
  }, [existingEstimation]);

  const calculateMarketSize = async () => {
    setIsCalculating(true);
    
    // Simulate AI-powered market calculation
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock calculation based on form data
      const mockEstimation: MarketEstimation = {
        tam: Math.floor(Math.random() * 50000000000) + 10000000000, // $10B - $60B
        sam: Math.floor(Math.random() * 5000000000) + 1000000000,   // $1B - $6B
        som: Math.floor(Math.random() * 500000000) + 100000000,     // $100M - $600M
        marketDescription: formData.marketDescription,
        assumptions: formData.assumptions.filter(a => a.trim()),
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        sources: [
          'Industry Research Reports',
          'Competitor Analysis',
          'Market Surveys',
          'Government Data'
        ],
        calculatedAt: new Date()
      };
      
      setEstimation(mockEstimation);
      setShowForm(false);
      onUpdate?.(mockEstimation);
    } catch (error) {
      console.error('Failed to calculate market size:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(1)}K`;
  };

  const addAssumption = () => {
    setFormData(prev => ({
      ...prev,
      assumptions: [...prev.assumptions, '']
    }));
  };

  const updateAssumption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      assumptions: prev.assumptions.map((a, i) => i === index ? value : a)
    }));
  };

  const removeAssumption = (index: number) => {
    if (formData.assumptions.length > 1) {
      setFormData(prev => ({
        ...prev,
        assumptions: prev.assumptions.filter((_, i) => i !== index)
      }));
    }
  };

  if (showForm) {
    return (
      <Card className="market-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Market Size Estimation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="market-description">Market Description</Label>
              <Textarea
                id="market-description"
                placeholder="Describe your target market, industry, and opportunity..."
                value={formData.marketDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, marketDescription: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                placeholder="Who are your ideal customers?"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="pricing-model">Pricing Model</Label>
              <Input
                id="pricing-model"
                placeholder="How will you price your product/service?"
                value={formData.pricingModel}
                onChange={(e) => setFormData(prev => ({ ...prev, pricingModel: e.target.value }))}
              />
            </div>

            <div>
              <Label>Key Assumptions</Label>
              <div className="space-y-2 mt-2">
                {formData.assumptions.map((assumption, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Assumption ${index + 1}`}
                      value={assumption}
                      onChange={(e) => updateAssumption(index, e.target.value)}
                    />
                    {formData.assumptions.length > 1 && (
                      <Button
                        onClick={() => removeAssumption(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button onClick={addAssumption} variant="outline" size="sm">
                  Add Assumption
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={calculateMarketSize} 
            disabled={isCalculating || !formData.marketDescription.trim()}
            className="w-full"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Calculating Market Size...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Market Size
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!estimation) {
    return (
      <Card className="market-card">
        <CardContent className="p-6 text-center">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No market estimation available</p>
          <Button onClick={() => setShowForm(true)}>
            Create Market Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'TAM', value: estimation.tam, color: COLORS[0] },
    { name: 'SAM', value: estimation.sam, color: COLORS[1] },
    { name: 'SOM', value: estimation.som, color: COLORS[2] }
  ];

  return (
    <Card className="market-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Estimation
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">{estimation.confidence}% Confidence</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Market Size Overview */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
          >
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(estimation.tam)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Addressable Market
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg"
          >
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estimation.sam)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Serviceable Addressable Market
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
          >
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(estimation.som)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Serviceable Obtainable Market
            </div>
          </motion.div>
        </div>

        {/* Visual Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Market Size']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Description */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Market Overview
          </h4>
          <p className="text-sm text-muted-foreground">
            {estimation.marketDescription}
          </p>
        </div>

        {/* Key Assumptions */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Key Assumptions
          </h4>
          <div className="space-y-2">
            {estimation.assumptions.map((assumption, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{assumption}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Data Sources
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {estimation.sources.map((source, index) => (
              <div key={index}>• {source}</div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            Recalculate
          </Button>
          <Button variant="outline" size="sm">
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}