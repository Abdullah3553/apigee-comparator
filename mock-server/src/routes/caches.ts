import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface Cache {
  name: string;
  description: string;
  expirySettings: {
    timeoutInSec: { value: string };
    valuesNull: boolean;
  };
  overflowToDisk: boolean;
  skipCacheIfElementSizeInKBExceeds: string;
  distributed: boolean;
  compression: { minimumSizeInKB: number };
}

interface CachesData {
  caches: Cache[];
}

// GET /v1/organizations/:org/environments/:env/caches - List caches
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<CachesData>(`${env}/caches.json`);
  res.json(data.caches.map(c => c.name));
});

// GET /v1/organizations/:org/environments/:env/caches/:cacheName - Get cache details
router.get('/:cacheName', (req: Request, res: Response) => {
  const { env, cacheName } = req.params;
  const data = loadData<CachesData>(`${env}/caches.json`);

  const cache = data.caches.find(c => c.name === cacheName);
  if (!cache) {
    throw new NotFoundError(`Cache '${cacheName}' not found in environment '${env}'`);
  }

  res.json(cache);
});

export default router;
