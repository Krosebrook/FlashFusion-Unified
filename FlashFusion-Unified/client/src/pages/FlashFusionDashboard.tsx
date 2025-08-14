import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { createNotionService, NotionDatabase } from "@/services/notionService";
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Box, Sphere } from '@react-three/drei';

// Physics demonstration component
const PhysicsDemo: React.FC = () => {
  return (
    <div className="h-96 w-full border rounded-lg overflow-hidden">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Physics debug>
          <RigidBody position={[0, 5, 0]}>
            <Box>
              <meshStandardMaterial color="orange" />
            </Box>
          </RigidBody>
          <RigidBody position={[2, 8, 0]}>
            <Sphere>
              <meshStandardMaterial color="blue" />
            </Sphere>
          </RigidBody>
          <CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
        </Physics>
      </Canvas>
    </div>
  );
};

// Notion integration component
const NotionIntegration: React.FC = () => {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const connectNotion = async () => {
    if (!apiKey) {
      alert('Please enter your Notion API key');
      return;
    }

    setLoading(true);
    try {
      const notionService = createNotionService(apiKey);
      const dbs = await notionService.getDatabases();
      setDatabases(dbs);
    } catch (error) {
      console.error('Failed to connect to Notion:', error);
      alert('Failed to connect to Notion. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notion Integration</h3>
      <div className="flex space-x-2">
        <input
          type="password"
          placeholder="Enter Notion API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 px-3 py-2 border border-input rounded-md"
        />
        <Button onClick={connectNotion} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
      
      {databases.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Connected Databases:</h4>
          <ul className="space-y-1">
            {databases.map((db) => (
              <li key={db.id} className="p-2 bg-muted rounded">
                {db.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FlashFusionDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">FlashFusion Dashboard</h1>
        <p className="text-muted-foreground">
          Your AI-powered business operating system with Notion integration and physics simulation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Physics Simulation</h2>
          <p className="text-muted-foreground">
            Interactive 3D physics powered by Rapier
          </p>
          <PhysicsDemo />
        </div>

        <div className="space-y-4">
          <NotionIntegration />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">AI Agents</h3>
          <p className="text-muted-foreground mb-4">
            6 core AI agents working together
          </p>
          <Button variant="outline" className="w-full">
            Manage Agents
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Workflows</h3>
          <p className="text-muted-foreground mb-4">
            Automated business processes
          </p>
          <Button variant="outline" className="w-full">
            View Workflows
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Revenue Streams</h3>
          <p className="text-muted-foreground mb-4">
            AI-generated business ideas
          </p>
          <Button variant="outline" className="w-full">
            Generate Ideas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashFusionDashboard;