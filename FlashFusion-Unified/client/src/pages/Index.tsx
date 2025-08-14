import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FlashFusion</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The AI operating system that turns your business ideas into automated revenue streams
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/creator">Creator Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;