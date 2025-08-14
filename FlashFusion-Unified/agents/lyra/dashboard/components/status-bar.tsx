'use client'

import { Activity, Cpu, Database, Zap } from 'lucide-react'
import { useLyraStore } from '@/lib/store'

export function StatusBar() {
  const { isProcessing, selectedMode, analysisCount } = useLyraStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-8 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Activity className={`w-3 h-3 ${isProcessing ? 'text-lyra-green animate-pulse' : ''}`} />
            <span>{isProcessing ? 'Processing' : 'Ready'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Mode: {selectedMode || 'None'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3" />
            <span>Analyses: {analysisCount}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3" />
            <span>v2.0.0</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-lyra-green animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}