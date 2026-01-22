import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

interface VirtualHost {
  name: string;
  hostAliases: string[];
  interfaces: string[];
  port: string;
  baseUrl: string;
  sSLInfo?: {
    enabled: boolean;
    keyStore: string;
    keyAlias: string;
    trustStore: string;
    clientAuthEnabled: boolean;
  };
  properties: {
    property: Array<{ name: string; value: string }>;
  };
}

interface VirtualHostsData {
  virtualHosts: VirtualHost[];
}

// GET /v1/organizations/:org/environments/:env/virtualhosts - List virtual hosts
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<VirtualHostsData>(`${env}/virtualHosts.json`);
  res.json(data.virtualHosts.map(v => v.name));
});

// GET /v1/organizations/:org/environments/:env/virtualhosts/:vhName - Get virtual host
router.get('/:vhName', (req: Request, res: Response) => {
  const { env, vhName } = req.params;
  const data = loadData<VirtualHostsData>(`${env}/virtualHosts.json`);

  const vhost = data.virtualHosts.find(v => v.name === vhName);
  if (!vhost) {
    throw new NotFoundError(`Virtual host '${vhName}' not found in environment '${env}'`);
  }

  res.json(vhost);
});

export default router;
