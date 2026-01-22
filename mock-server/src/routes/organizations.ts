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

/**
 * @openapi
 * /v1/organizations:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: List all organizations
 *     description: Returns a list of organization names
 *     responses:
 *       200:
 *         description: List of organization names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["mock-org"]
 *       401:
 *         description: Unauthorized
 */
router.get('/', (_req: Request, res: Response) => {
  const data = loadData<OrganizationsData>('organizations.json');
  res.json(data.list);
});

/**
 * @openapi
 * /v1/organizations/{org}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization details
 *     description: Returns detailed information about a specific organization
 *     parameters:
 *       - in: path
 *         name: org
 *         required: true
 *         schema:
 *           type: string
 *           example: mock-org
 *         description: Organization name
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
