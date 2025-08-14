'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit3,
  Download,
  Share2,
  MoreHorizontal,
  Check,
  X,
  FileText,
  FileDown,
  Link2,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ProjectHeaderProps {
  projectName: string;
  confidence?: number;
  recommendation?: string;
  lastUpdated: Date;
  onRename: (newName: string) => Promise<void>;
  onExport: (format: 'pdf' | 'markdown') => Promise<void>;
  onShare: () => Promise<void>;
  className?: string;
}

export function ProjectHeader({
  projectName,
  confidence = 0,
  recommendation,
  lastUpdated,
  onRename,
  onExport,
  onShare,
  className = ''
}: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (editedName.trim() === projectName || !editedName.trim()) {
      setIsEditing(false);
      setEditedName(projectName);
      return;
    }

    setIsLoading(true);
    try {
      await onRename(editedName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to rename project:', error);
      setEditedName(projectName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(projectName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (confidence >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    if (confidence >= 40) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`project-header ${className}`}>
      <Card className="shadow-sm border-0 bg-gradient-to-r from-background to-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Left Section - Project Info */}
            <div className="flex-1 min-w-0">
              {/* Project Name */}
              <div className="flex items-center gap-3 mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="text-2xl font-bold h-auto py-1 px-2"
                      disabled={isLoading}
                      autoFocus
                    />
                    <Button
                      onClick={handleRename}
                      disabled={isLoading}
                      size="sm"
                      className="shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <h1 className="text-2xl font-bold text-foreground truncate">
                      {projectName}
                    </h1>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-6 flex-wrap">
                {/* Confidence Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${getConfidenceColor(confidence)}`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>{confidence}% {getConfidenceLabel(confidence)}</span>
                  </div>
                </motion.div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {formatDate(lastUpdated)}</span>
                </div>
              </div>

              {/* Recommendation Preview */}
              {recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg"
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">AI Recommendation:</span>{' '}
                    {recommendation.length > 150 
                      ? `${recommendation.substring(0, 150)}...` 
                      : recommendation
                    }
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="export-controls flex items-center gap-2 ml-6">
              {/* Export Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport('pdf')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('markdown')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Share Button */}
              <Button
                onClick={onShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onShare}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onExport('pdf')}
                    className="text-muted-foreground"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}