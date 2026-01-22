import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface TargetServer {
  name: string;
  host: string;
  port: number;
  isEnabled: boolean;
  sSLInfo?: {
    enabled: boolean;
    clientAuthEnabled: boolean;
    keyStore: string;
    keyAlias: string;
    trustStore: string;
    ignoreValidationErrors: boolean;
    ciphers: string[];
    protocols: string[];
  };
}

interface TargetServersData {
  targetServers: TargetServer[];
}

// GET /v1/organizations/:org/environments/:env/targetservers - List target servers
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<TargetServersData>(`${env}/targetServers.json`);
  res.json(data.targetServers.map(t => t.name));
});

// GET /v1/organizations/:org/environments/:env/targetservers/:name - Get target server
router.get('/:name', (req: Request, res: Response) => {
  const { env, name } = req.params;
  const data = loadData<TargetServersData>(`${env}/targetServers.json`);

  const server = data.targetServers.find(t => t.name === name);
  if (!server) {
    throw new NotFoundError(`Target server '${name}' not found in environment '${env}'`);
  }

  res.json(server);
});

export default router;
