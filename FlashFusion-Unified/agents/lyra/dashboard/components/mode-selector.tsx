'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { modes } from '@/lib/constants';
import { ModeIcons } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModeSelectorProps {
  selectedMode: string | null;
  onModeSelect: (mode: string) => void;
  modeIcons: ModeIcons;
}

export function ModeSelector({ selectedMode, onModeSelect, modeIcons }: ModeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Modes</CardTitle>
        <CardDescription>Select an analysis mode to begin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id]
          const isSelected = selectedMode === mode.id
          
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeSelect(mode.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all',
                isSelected ? [
                  'border-2',
                  mode.borderColor,
                  mode.bgColor,
                ] : [
                  'border-border hover:border-muted-foreground/30',
                  'hover:bg-muted/50'
                ]
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isSelected ? mode.bgColor : 'bg-muted'
                )}>
                  <Icon className={cn('w-4 h-4', isSelected ? mode.color : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{mode.name}</h3>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                  <p className="text-xs text-muted-foreground/70 italic">"{mode.trigger}"</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </CardContent>
    </Card>
  )
}