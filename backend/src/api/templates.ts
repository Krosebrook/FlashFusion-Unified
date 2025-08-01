import { Router } from 'express';
const router = Router();

router.get('/', (_, res) => {
  res.json(['web-react-basic', 'mobile-react-native', 'desktop-electron', 'cli-nodejs', 'extension-chrome']);
});

export default router;