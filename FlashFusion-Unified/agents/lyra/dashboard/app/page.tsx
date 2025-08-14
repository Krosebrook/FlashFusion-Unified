"use client";

import { ContextPanel } from "@/components/context-panel";
import { Header } from "@/components/header";
import { InputPanel } from "@/components/input-panel";
import { ModeSelector } from "@/components/mode-selector";
import { ResultsPanel } from "@/components/results-panel";
import { StatusBar } from "@/components/status-bar";
import { VisualizationCanvas } from "@/components/visualization-canvas";
import { useLyraStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, GitBranch, Package, RefreshCw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const modeIcons = {
  SYSTEMS_MAP: GitBranch,
  IDEA_BURNER: Brain,
  STRUCTURE: Package,
  MVP_RUN: Zap,
  PSYCH_DEPTH: Brain,
  LOOP_TEST: RefreshCw,
  STACK_SYNC: Package,
};

export default function LyraDashboard() {
  const { selectedMode, isProcessing, results, setSelectedMode } =
    useLyraStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 text-foreground grid-pattern">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Sidebar - Mode Selector */}
          <div className="lg:col-span-3 space-y-4">
            <ModeSelector
              selectedMode={selectedMode}
              onModeSelect={setSelectedMode}
              modeIcons={modeIcons}
            />
            <ContextPanel mode={selectedMode} />
          </div>

          {/* Center - Main Content */}
          <div className="lg:col-span-6 space-y-4">
            <InputPanel />
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <div className="bg-card border border-border rounded-lg p-8 h-[500px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="inline-flex p-4 rounded-full bg-lyra-purple/10 animate-pulse-glow">
                        <Brain className="w-12 h-12 text-lyra-purple" />
                      </div>
                      <p className="text-muted-foreground">
                        LYRA is analyzing...
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="visualization"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <VisualizationCanvas />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Results */}
          <div className="lg:col-span-3">
            <ResultsPanel results={results} />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
