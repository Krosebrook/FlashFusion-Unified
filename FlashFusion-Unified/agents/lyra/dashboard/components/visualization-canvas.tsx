"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLyraStore } from "@/lib/store";
import { Download, Maximize2, RefreshCw } from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";

export function VisualizationCanvas() {
  const { results, selectedMode } = useLyraStore();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      themeVariables: {
        primaryColor: "#8B5CF6",
        primaryTextColor: "#fff",
        primaryBorderColor: "#7C3AED",
        lineColor: "#5B21B6",
        secondaryColor: "#14B8A6",
        tertiaryColor: "#EC4899",
        background: "#1F2937",
        mainBkg: "#111827",
        secondBkg: "#1F2937",
        tertiaryBkg: "#374151",
        borderColor: "#4B5563", // Renamed to avoid duplication
        fontFamily: "Inter, sans-serif",
      },
    });
  }, []);

  useEffect(() => {
    if (results?.diagram && mermaidRef.current) {
      mermaidRef.current.innerHTML = results.diagram;
      mermaid.contentLoaded();
    }
  }, [results]);

  const defaultDiagram = `graph TD
    A[Input] --> B{LYRA Analysis}
    B --> C[Systems Map]
    B --> D[Idea Validation]
    B --> E[Structure Blueprint]
    B --> F[MVP Design]
    B --> G[Psychology Map]
    B --> H[Loop Analysis]
    B --> I[Stack Integration]
    
    style A fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style B fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff
    style C fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style D fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff
    style E fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style F fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style G fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style H fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style I fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff`;

  const exportDiagram = () => {
    // TODO: Implement diagram export
    console.log("Exporting diagram...");
  };

  const refreshDiagram = () => {
    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  };

  return (
    <Card className="h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visualization</CardTitle>
        <div className="flex items-center space-x-2">
          <Button size="icon" variant="ghost" onClick={refreshDiagram}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={exportDiagram}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)] overflow-auto">
        <div className="h-full flex items-center justify-center">
          {results?.diagram ? (
            <div ref={mermaidRef} className="mermaid w-full h-full" />
          ) : (
            <div className="mermaid w-full h-full">{defaultDiagram}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
