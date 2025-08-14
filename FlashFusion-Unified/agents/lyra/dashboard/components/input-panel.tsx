'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, Brain, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLyraStore } from '@/lib/store';
import { inputTemplates } from '@/lib/constants';
import toast from 'react-hot-toast';

export function InputPanel() {
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const { selectedMode, runAnalysis } = useLyraStore()

  const handleSubmit = async () => {
    if (!selectedMode) {
      toast.error('Please select an analysis mode first')
      return
    }

    if (!input.trim()) {
      toast.error('Please provide input for analysis')
      return
    }

    await runAnalysis(input)
  }

  const loadTemplate = (template: keyof typeof inputTemplates) => {
    setInput(inputTemplates[template])
    toast.success('Template loaded')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Input</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('system')}
              className="text-xs"
            >
              <FileText className="w-3 h-3 mr-1" />
              System
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('idea')}
              className="text-xs"
            >
              <Brain className="w-3 h-3 mr-1" />
              Idea
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('brainstorm')}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Brainstorm
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Describe your system, idea, or problem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="yaml" className="space-y-4">
            <Textarea
              placeholder={`system: "Your system name"
components:
  - "Component 1"
  - "Component 2"
pain_points:
  - "Issue 1"
  - "Issue 2"`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="json" className="space-y-4">
            <Textarea
              placeholder={`{
  "system": "Your system name",
  "components": ["Component 1", "Component 2"],
  "pain_points": ["Issue 1", "Issue 2"]
}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">
            {input.length} characters
          </span>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleSubmit}
              disabled={!selectedMode || !input.trim()}
              className="bg-gradient-to-r from-lyra-purple to-lyra-teal hover:from-lyra-purple/90 hover:to-lyra-teal/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}