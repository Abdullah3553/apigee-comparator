import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface Environment {
  name: string;
  createdAt: number;
  createdBy: string;
  lastModifiedAt: number;
  lastModifiedBy: string;
  properties: {
    property: Array<{ name: string; value: string }>;
  };
}

interface OrganizationsData {
  organizations: Array<{
    name: string;
    environments: string[];
  }>;
}

// GET /v1/organizations/:org/environments - List environments
router.get('/', (req: Request, res: Response) => {
  const { org } = req.params;
  const data = loadData<OrganizationsData>('organizations.json');

  const organization = data.organizations.find(o => o.name === org);
  if (!organization) {
    throw new NotFoundError(`Organization '${org}' not found`);
  }

  res.json(organization.environments);
});

// GET /v1/organizations/:org/environments/:env - Get environment details
router.get('/:env', (req: Request, res: Response) => {
  const { org, env } = req.params;
  const data = loadData<OrganizationsData>('organizations.json');

  const organization = data.organizations.find(o => o.name === org);
  if (!organization) {
    throw new NotFoundError(`Organization '${org}' not found`);
  }

  if (!organization.environments.includes(env)) {
    throw new NotFoundError(`Environment '${env}' not found in organization '${org}'`);
  }

  const envData = loadData<Environment>(`${env}/environment.json`);
  res.json(envData);
});

export default router;
