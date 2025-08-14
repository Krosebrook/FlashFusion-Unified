'use client'

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardCard {
  id: string;
  type: 'analysis' | 'market-estimation' | 'feature-priority' | 'historical' | 'custom';
  title: string;
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

interface DraggableDashboardProps {
  reportId: string;
  initialLayout: DashboardCard[];
  onLayoutChange: (layout: DashboardCard[]) => void;
  className?: string;
}

export function DraggableDashboard({ 
  reportId, 
  initialLayout, 
  onLayoutChange, 
  className = '' 
}: DraggableDashboardProps) {
  const [cards, setCards] = useState<DashboardCard[]>(initialLayout);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCards(initialLayout);
  }, [initialLayout]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) {
      return;
    }

    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCards(items);
    onLayoutChange(items);
  };

  const removeCard = (cardId: string) => {
    const updatedCards = cards.filter(card => card.id !== cardId);
    setCards(updatedCards);
    onLayoutChange(updatedCards);
  };

  const addCard = (cardType: DashboardCard['type']) => {
    const newCard: DashboardCard = {
      id: `${cardType}-${Date.now()}`,
      type: cardType,
      title: getCardTitle(cardType),
      content: getCardContent(cardType),
      size: 'medium'
    };
    
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    onLayoutChange(updatedCards);
  };

  const getCardTitle = (type: DashboardCard['type']): string => {
    const titles = {
      'analysis': 'AI Analysis',
      'market-estimation': 'Market Estimation',
      'feature-priority': 'Feature Prioritization',
      'historical': 'Historical Analysis',
      'custom': 'Custom Widget'
    };
    return titles[type];
  };

  const getCardContent = (type: DashboardCard['type']): React.ReactNode => {
    const content = {
      'analysis': <div className="p-4 text-center text-muted-foreground">Add AI analysis content</div>,
      'market-estimation': <div className="p-4 text-center text-muted-foreground">Add market estimation</div>,
      'feature-priority': <div className="p-4 text-center text-muted-foreground">Add feature prioritization</div>,
      'historical': <div className="p-4 text-center text-muted-foreground">Add historical analysis</div>,
      'custom': <div className="p-4 text-center text-muted-foreground">Custom widget content</div>
    };
    return content[type];
  };

  const getCardSize = (size: DashboardCard['size'] = 'medium') => {
    const sizes = {
      'small': 'col-span-1',
      'medium': 'col-span-1 md:col-span-2',
      'large': 'col-span-1 md:col-span-3'
    };
    return sizes[size];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Add Card Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => addCard('analysis')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Analysis
        </Button>
        <Button
          onClick={() => addCard('market-estimation')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Market Data
        </Button>
        <Button
          onClick={() => addCard('feature-priority')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Features
        </Button>
        <Button
          onClick={() => addCard('historical')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Historical
        </Button>
      </div>

      {/* Draggable Dashboard Grid */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-cards">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-200 ${
                snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg p-4' : ''
              }`}
            >
              <AnimatePresence>
                {cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getCardSize(card.size)} ${
                          snapshot.isDragging ? 'z-50' : ''
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className={`h-full transition-all duration-200 hover:shadow-lg ${
                            snapshot.isDragging 
                              ? 'shadow-2xl rotate-2 scale-105' 
                              : 'hover:shadow-md'
                          }`}
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-muted"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              {card.title}
                            </CardTitle>
                            <Button
                              onClick={() => removeCard(card.id)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="min-h-[200px]">
                              {card.content}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-2 border-dashed border-muted rounded-lg"
        >
          <div className="text-muted-foreground mb-4">
            Your dashboard is empty. Add some cards to get started!
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={() => addCard('analysis')} variant="outline">
              Add Analysis Card
            </Button>
            <Button onClick={() => addCard('market-estimation')} variant="outline">
              Add Market Card
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}