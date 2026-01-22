import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

interface Kvm {
  name: string;
  encrypted: boolean;
  entry: Array<{ name: string; value: string }>;
}

interface KvmsData {
  kvms: Kvm[];
}

// GET /v1/organizations/:org/environments/:env/keyvaluemaps - List KVMs
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<KvmsData>(`${env}/kvms.json`);
  res.json(data.kvms.map(k => k.name));
});

// GET /v1/organizations/:org/environments/:env/keyvaluemaps/:kvmName - Get KVM details
router.get('/:kvmName', (req: Request, res: Response) => {
  const { env, kvmName } = req.params;
  const data = loadData<KvmsData>(`${env}/kvms.json`);

  const kvm = data.kvms.find(k => k.name === kvmName);
  if (!kvm) {
    throw new NotFoundError(`KVM '${kvmName}' not found in environment '${env}'`);
  }

  res.json(kvm);
});

export default router;
