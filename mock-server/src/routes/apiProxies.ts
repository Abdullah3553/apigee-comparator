import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface ApiProxy {
  name: string;
  revision: string[];
  metaData: {
    createdAt: number;
    createdBy: string;
    lastModifiedAt: number;
    lastModifiedBy: string;
  };
  type: string;
}

interface ProxyDeployment {
  name: string;
  organization: string;
  environment: Array<{
    name: string;
    revision: Array<{
      name: string;
      state: string;
      server: Array<{
        status: string;
        type: string;
        uUID: string;
      }>;
    }>;
  }>;
}

interface ApiProxiesData {
  proxies: ApiProxy[];
  deployments: ProxyDeployment[];
}

// GET /v1/organizations/:org/apis - List all API proxies
router.get('/', (req: Request, res: Response) => {
  const { org: _org } = req.params;
  const data = loadData<ApiProxiesData>('dev/apiProxies.json');

  // Return just proxy names
  res.json(data.proxies.map(p => p.name));
});

// GET /v1/organizations/:org/apis/:apiName - Get proxy details
router.get('/:apiName', (req: Request, res: Response) => {
  const { org, apiName } = req.params;
  const data = loadData<ApiProxiesData>('dev/apiProxies.json');

  const proxy = data.proxies.find(p => p.name === apiName);
  if (!proxy) {
    throw new NotFoundError(`API Proxy '${apiName}' not found in organization '${org}'`);
  }

  res.json(proxy);
});

// GET /v1/organizations/:org/apis/:apiName/deployments - Get deployment status
router.get('/:apiName/deployments', (req: Request, res: Response) => {
  const { org: _org, apiName } = req.params;
  const data = loadData<ApiProxiesData>('dev/apiProxies.json');

  const deployment = data.deployments.find(d => d.name === apiName);
  if (!deployment) {
    throw new NotFoundError(`Deployment for API Proxy '${apiName}' not found`);
  }

  res.json(deployment);
});

export default router;
