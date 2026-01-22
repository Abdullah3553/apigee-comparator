import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

interface Organization {
  name: string;
  displayName: string;
  type: string;
  createdAt: number;
  createdBy: string;
  lastModifiedAt: number;
  lastModifiedBy: string;
  environments: string[];
  properties: {
    property: Array<{ name: string; value: string }>;
  };
}

interface OrganizationsData {
  organizations: Organization[];
  list: string[];
}

// GET /v1/organizations - List all organizations
router.get('/', (_req: Request, res: Response) => {
  const data = loadData<OrganizationsData>('organizations.json');
  res.json(data.list);
});

// GET /v1/organizations/:org - Get organization details
router.get('/:org', (req: Request, res: Response) => {
  const { org } = req.params;
  const data = loadData<OrganizationsData>('organizations.json');

  const organization = data.organizations.find(o => o.name === org);
  if (!organization) {
    throw new NotFoundError(`Organization '${org}' not found`);
  }

  res.json(organization);
});

export default router;
