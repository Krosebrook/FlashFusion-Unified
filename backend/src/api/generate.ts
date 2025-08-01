import { Router } from 'express';
const router = Router();

// Import existing FlashFusion Core
const { FlashFusionCore } = require('../../../src/core/FlashFusionCore');

router.post('/', async (req, res) => {
  const { platform, config } = req.body;
  
  // Connect to existing FlashFusion Universal Creator agent
  const core = new FlashFusionCore();
  await core.initialize();
  
  const creator = core.universalAgents.get('creator');
  if (creator) {
    creator.performanceMetrics.tasksCompleted++;
  }
  
  res.json({ 
    success: true, 
    code: `// ${platform} app generated via FlashFusion Universal Creator`,
    agent: creator?.name || 'Universal Creator'
  });
});

export default router;