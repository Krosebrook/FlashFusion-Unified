'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download, Share2 } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import toast from 'react-hot-toast';

interface ResultsPanelProps {
  results: AnalysisResult | null;
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const exportResults = () => {
    if (!results) return
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lyra-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported')
  }

  if (!results) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Analysis results will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No results yet. Select a mode and run an analysis.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Results</CardTitle>
            <CardDescription>{results.mode} Analysis</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost" onClick={exportResults}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formatted" className="h-[600px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatted" className="h-[calc(100%-40px)]">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {Object.entries(results.output || {}).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    {Array.isArray(value) ? (
                      <ul className="space-y-1">
                        {value.map((item, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="text-lyra-purple mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : typeof value === 'object' ? (
                      <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">{String(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="raw" className="h-[calc(100%-40px)]">
            <div className="relative h-full">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10"
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <ScrollArea className="h-full">
                <pre className="text-xs bg-muted p-4 rounded-lg">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="h-[calc(100%-40px)]">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Export Formats</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Badge className="mr-2">JSON</Badge>
                    MiniArtifact Format
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Badge className="mr-2">MD</Badge>
                    Markdown Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Badge className="mr-2">YAML</Badge>
                    Configuration File
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Badge className="mr-2">API</Badge>
                    Claude MCP Format
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Integration</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Send to GitHub
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Create Jira Ticket
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Save to Notion
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}