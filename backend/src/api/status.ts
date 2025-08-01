import { Router } from 'express';
const router = Router();

router.get('/', (_, res) => {
  res.json({ status: 'OK', timestamp: Date.now() });
});

export default router;