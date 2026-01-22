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

/**
 * @openapi
 * /v1/organizations/{org}/environments:
 *   get:
 *     tags:
 *       - Environments
 *     summary: List environments
 *     parameters:
 *       - in: path
 *         name: org
 *         required: true
 *         schema:
 *           type: string
 *           example: mock-org
 *     responses:
 *       200:
 *         description: List of environment names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["dev", "staging"]
 */
router.get('/', (req: Request, res: Response) => {
  const { org } = req.params;
  const data = loadData<OrganizationsData>('organizations.json');

  const organization = data.organizations.find(o => o.name === org);
  if (!organization) {
    throw new NotFoundError(`Organization '${org}' not found`);
  }

  res.json(organization.environments);
});

/**
 * @openapi
 * /v1/organizations/{org}/environments/{env}:
 *   get:
 *     tags:
 *       - Environments
 *     summary: Get environment details
 *     parameters:
 *       - in: path
 *         name: org
 *         required: true
 *         schema:
 *           type: string
 *           example: mock-org
 *       - in: path
 *         name: env
 *         required: true
 *         schema:
 *           type: string
 *           example: dev
 *     responses:
 *       200:
 *         description: Environment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Environment'
 */
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
