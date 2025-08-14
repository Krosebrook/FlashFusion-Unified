'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Play, SkipForward } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Enhanced Dashboard! 🎉',
    content: 'Let\'s take a quick tour of the new features that will help you analyze your business opportunities more effectively.',
    target: '.dashboard-container',
    placement: 'bottom'
  },
  {
    id: 'project-header',
    title: 'Project Overview',
    content: 'Here you can see your project name, confidence level, and quick actions like rename, export, and share.',
    target: '.project-header',
    placement: 'bottom'
  },
  {
    id: 'drag-drop',
    title: 'Customizable Dashboard',
    content: 'Drag and drop cards to reorganize your dashboard. Add new analysis cards using the buttons above.',
    target: '.dashboard-cards',
    placement: 'top'
  },
  {
    id: 'analysis-card',
    title: 'AI Analysis Cards',
    content: 'Each card shows different aspects of your analysis. Click the grip icon to drag, or the X to remove.',
    target: '.analysis-card',
    placement: 'right'
  },
  {
    id: 'market-estimation',
    title: 'Market Size Analysis',
    content: 'Get detailed market sizing with TAM, SAM, and SOM calculations to understand your opportunity.',
    target: '.market-card',
    placement: 'left'
  },
  {
    id: 'export-features',
    title: 'Export & Share',
    content: 'Export your analysis as PDF or Markdown, and share with stakeholders using the header controls.',
    target: '.export-controls',
    placement: 'bottom'
  }
];

export function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible && tourSteps.length > 0) {
      setIsActive(true);
      highlightElement(tourSteps[0].target);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      highlightElement(tourSteps[currentStep].target);
    }
  }, [currentStep, isActive]);

  const highlightElement = (selector: string) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    // Add highlight to current target
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    setIsActive(false);
    onComplete();
  };

  const skipTour = () => {
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    setIsActive(false);
    onSkip();
  };

  const currentTourStep = tourSteps[currentStep];

  if (!isVisible || !isActive || !currentTourStep) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={skipTour}
      />

      {/* Tour Tooltip */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed z-[60] max-w-sm"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {currentTourStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentTourStep.content}
                  </p>
                </div>
                <Button
                  onClick={skipTour}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Step {currentStep + 1} of {tourSteps.length}</span>
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((currentStep + 1) / tourSteps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Previous
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={skipTour}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <SkipForward className="h-3 w-3" />
                    Skip Tour
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <Play className="h-3 w-3" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Button */}
              {currentTourStep.action && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={currentTourStep.action}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    Try it now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard Navigation Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60]"
      >
        <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-2 text-xs text-muted-foreground">
          Use ← → arrow keys or click buttons to navigate
        </div>
      </motion.div>
    </>
  );
}

// Keyboard navigation
export function useTourKeyboardNavigation(
  isActive: boolean,
  currentStep: number,
  totalSteps: number,
  onNext: () => void,
  onPrev: () => void,
  onSkip: () => void
) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
        case 'Escape':
          event.preventDefault();
          onSkip();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, totalSteps, onNext, onPrev, onSkip]);
}