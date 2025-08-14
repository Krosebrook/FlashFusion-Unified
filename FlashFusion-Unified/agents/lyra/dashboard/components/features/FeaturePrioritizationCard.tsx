'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Plus, 
  Star, 
  Users, 
  Zap, 
  Clock, 
  Target,
  ChevronUp,
  ChevronDown,
  Settings,
  CheckCircle
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  description: string;
  reach: number;      // How many users will benefit (1-10)
  impact: number;     // How much it will improve user experience (1-10)
  confidence: number; // How confident we are in our estimates (1-10)
  effort: number;     // How much effort it will take (1-10, lower is better)
  riceScore: number;  // RICE score calculation
  priority: 'high' | 'medium' | 'low';
}

interface FeaturePrioritizationCardProps {
  reportId: string;
  existingPrioritization?: Feature[] | null;
  onUpdate?: (features: Feature[]) => void;
}

export function FeaturePrioritizationCard({ 
  reportId, 
  existingPrioritization, 
  onUpdate 
}: FeaturePrioritizationCardProps) {
  const [features, setFeatures] = useState<Feature[]>(existingPrioritization || []);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reach: [5],
    impact: [5],
    confidence: [5],
    effort: [5]
  });

  useEffect(() => {
    if (existingPrioritization) {
      setFeatures(existingPrioritization);
    }
  }, [existingPrioritization]);

  const calculateRiceScore = (reach: number, impact: number, confidence: number, effort: number) => {
    return Math.round((reach * impact * confidence) / effort);
  };

  const getPriority = (riceScore: number): Feature['priority'] => {
    if (riceScore >= 75) return 'high';
    if (riceScore >= 50) return 'medium';
    return 'low';
  };

  const addFeature = () => {
    const riceScore = calculateRiceScore(
      formData.reach[0],
      formData.impact[0],
      formData.confidence[0],
      formData.effort[0]
    );

    const newFeature: Feature = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      reach: formData.reach[0],
      impact: formData.impact[0],
      confidence: formData.confidence[0],
      effort: formData.effort[0],
      riceScore,
      priority: getPriority(riceScore)
    };

    const updatedFeatures = [...features, newFeature].sort((a, b) => b.riceScore - a.riceScore);
    setFeatures(updatedFeatures);
    onUpdate?.(updatedFeatures);
    resetForm();
  };

  const updateFeature = () => {
    if (!editingFeature) return;

    const riceScore = calculateRiceScore(
      formData.reach[0],
      formData.impact[0],
      formData.confidence[0],
      formData.effort[0]
    );

    const updatedFeature: Feature = {
      ...editingFeature,
      name: formData.name,
      description: formData.description,
      reach: formData.reach[0],
      impact: formData.impact[0],
      confidence: formData.confidence[0],
      effort: formData.effort[0],
      riceScore,
      priority: getPriority(riceScore)
    };

    const updatedFeatures = features
      .map(f => f.id === editingFeature.id ? updatedFeature : f)
      .sort((a, b) => b.riceScore - a.riceScore);
    
    setFeatures(updatedFeatures);
    onUpdate?.(updatedFeatures);
    setEditingFeature(null);
    resetForm();
  };

  const deleteFeature = (id: string) => {
    const updatedFeatures = features.filter(f => f.id !== id);
    setFeatures(updatedFeatures);
    onUpdate?.(updatedFeatures);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      reach: [5],
      impact: [5],
      confidence: [5],
      effort: [5]
    });
    setShowForm(false);
    setEditingFeature(null);
  };

  const startEditing = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      name: feature.name,
      description: feature.description,
      reach: [feature.reach],
      impact: [feature.impact],
      confidence: [feature.confidence],
      effort: [feature.effort]
    });
    setShowForm(true);
  };

  const getPriorityColor = (priority: Feature['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const chartData = features.map(feature => ({
    name: feature.name.length > 15 ? feature.name.substring(0, 15) + '...' : feature.name,
    score: feature.riceScore,
    priority: feature.priority
  }));

  return (
    <Card className="feature-priority-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Feature Prioritization (RICE)
          </div>
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add/Edit Feature Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 border border-border rounded-lg bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  {editingFeature ? 'Edit Feature' : 'Add New Feature'}
                </h4>
                <Button onClick={resetForm} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feature-name">Feature Name</Label>
                    <Input
                      id="feature-name"
                      placeholder="Enter feature name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="feature-description">Description</Label>
                    <Textarea
                      id="feature-description"
                      placeholder="Describe the feature and its benefits"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reach: {formData.reach[0]}/10
                    </Label>
                    <Slider
                      value={formData.reach}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, reach: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How many users will this feature reach?
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Impact: {formData.impact[0]}/10
                    </Label>
                    <Slider
                      value={formData.impact}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How much will this impact user experience?
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Confidence: {formData.confidence[0]}/10
                    </Label>
                    <Slider
                      value={formData.confidence}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, confidence: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How confident are you in your estimates?
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Effort: {formData.effort[0]}/10
                    </Label>
                    <Slider
                      value={formData.effort}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, effort: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How much effort will this require? (1 = easy, 10 = very hard)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  RICE Score: {calculateRiceScore(formData.reach[0], formData.impact[0], formData.confidence[0], formData.effort[0])}
                  <Badge className={`ml-2 ${getPriorityColor(getPriority(calculateRiceScore(formData.reach[0], formData.impact[0], formData.confidence[0], formData.effort[0])))}`}>
                    {getPriority(calculateRiceScore(formData.reach[0], formData.impact[0], formData.confidence[0], formData.effort[0]))} priority
                  </Badge>
                </div>
                <Button
                  onClick={editingFeature ? updateFeature : addFeature}
                  disabled={!formData.name.trim()}
                >
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Chart */}
        {features.length > 0 && (
          <div className="h-64">
            <h4 className="font-semibold mb-4">RICE Score Comparison</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} RICE Score`,
                    `Priority: ${props.payload.priority}`
                  ]}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-semibold">Feature Backlog (Sorted by RICE Score)</h4>
          {features.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No features added yet. Click "Add Feature" to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium">{feature.name}</h5>
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                        <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          RICE: {feature.riceScore}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Reach: {feature.reach}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>Impact: {feature.impact}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Confidence: {feature.confidence}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Effort: {feature.effort}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        onClick={() => startEditing(feature)}
                        variant="ghost"
                        size="sm"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteFeature(feature.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RICE Methodology Explanation */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">About RICE Prioritization</h4>
          <p className="text-sm text-muted-foreground mb-3">
            RICE is a scoring model to help prioritize features. The score is calculated as:
          </p>
          <div className="text-sm font-mono bg-background p-2 rounded border">
            RICE Score = (Reach × Impact × Confidence) ÷ Effort
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
            <div>
              <strong>Reach:</strong> Number of users affected
            </div>
            <div>
              <strong>Impact:</strong> Effect on user experience
            </div>
            <div>
              <strong>Confidence:</strong> How sure you are
            </div>
            <div>
              <strong>Effort:</strong> Resources required
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}