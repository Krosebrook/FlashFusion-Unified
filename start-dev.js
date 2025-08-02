const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FlashFusion Development Servers...');

// Start backend server
const backend = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Start frontend server  
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle process cleanup
process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});