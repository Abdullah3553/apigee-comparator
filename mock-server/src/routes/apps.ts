import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface App {
  appId: string;
  name: string;
  accessType: string;
  appFamily: string;
  callbackUrl: string;
  developerId: string;
  status: string;
  credentials: Array<{
    consumerKey: string;
    consumerSecret: string;
    expiresAt: number;
    issuedAt: number;
    status: string;
    apiProducts: Array<{
      apiproduct: string;
      status: string;
    }>;
  }>;
  createdAt: number;
  createdBy: string;
  lastModifiedAt: number;
  lastModifiedBy: string;
}

interface AppsData {
  app: App[];
}

// GET /v1/organizations/:org/apps?expand=true - List all apps (expanded)
router.get('/', (req: Request, res: Response) => {
  const { org: _org } = req.params;
  const { expand } = req.query;

  // For simplicity, we'll load from dev environment as default
  // In real Apigee, apps are org-level but we store them per env for comparison testing
  const data = loadData<AppsData>('dev/apps.json');

  if (expand === 'true') {
    res.json(data);
  } else {
    // Return just app names
    res.json(data.app.map(a => a.name));
  }
});

// GET /v1/organizations/:org/apps/:appId - Get single app details
router.get('/:appId', (req: Request, res: Response) => {
  const { org, appId } = req.params;
  const data = loadData<AppsData>('dev/apps.json');

  const app = data.app.find(a => a.appId === appId || a.name === appId);
  if (!app) {
    throw new NotFoundError(`App '${appId}' not found in organization '${org}'`);
  }

  res.json(app);
});

export default router;
