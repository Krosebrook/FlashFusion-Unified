#!/usr/bin/env ts-node
import inquirer from 'inquirer';
import { generateApp } from '../frontend/src/services/api';

(async () => {
  const answers = await inquirer.prompt([
    { name: 'platform', message: 'Choose platform:', type: 'list', choices: ['web', 'mobile', 'desktop', 'cli', 'extension'] },
    { name: 'name', message: 'App name:' },
    { name: 'features', message: 'Features (comma-separated):' }
  ]);

  const config = {
    platform: answers.platform,
    config: {
      name: answers.name,
      features: answers.features.split(',').map((f: string) => f.trim())
    }
  };

  const result = await generateApp(config);
  console.log('✅ App Generated:\n', result.code);
})();