import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface Reference {
  name: string;
  refers: string;
  resourceType: string;
}

interface ReferencesData {
  references: Reference[];
}

// GET /v1/organizations/:org/environments/:env/references - List references
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<ReferencesData>(`${env}/references.json`);
  res.json(data.references.map(r => r.name));
});

// GET /v1/organizations/:org/environments/:env/references/:refName - Get reference
router.get('/:refName', (req: Request, res: Response) => {
  const { env, refName } = req.params;
  const data = loadData<ReferencesData>(`${env}/references.json`);

  const reference = data.references.find(r => r.name === refName);
  if (!reference) {
    throw new NotFoundError(`Reference '${refName}' not found in environment '${env}'`);
  }

  res.json(reference);
});

export default router;
