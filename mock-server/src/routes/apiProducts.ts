import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

interface ApiProduct {
  name: string;
  displayName: string;
  description: string;
  approvalType: string;
  attributes: Array<{ name: string; value: string }>;
  environments: string[];
  proxies: string[];
  quota: string;
  quotaInterval: string;
  quotaTimeUnit: string;
  scopes: string[];
  createdAt: number;
  lastModifiedAt: number;
}

interface ApiProductsData {
  apiProduct: ApiProduct[];
}

// GET /v1/organizations/:org/apiproducts?expand=true - List all API products
router.get('/', (req: Request, res: Response) => {
  const { org: _org } = req.params;
  const { expand } = req.query;

  const data = loadData<ApiProductsData>('dev/apiProducts.json');

  if (expand === 'true') {
    res.json(data);
  } else {
    // Return just product names
    res.json(data.apiProduct.map(p => p.name));
  }
});

// GET /v1/organizations/:org/apiproducts/:productName - Get single product
router.get('/:productName', (req: Request, res: Response) => {
  const { org, productName } = req.params;
  const data = loadData<ApiProductsData>('dev/apiProducts.json');

  const product = data.apiProduct.find(p => p.name === productName);
  if (!product) {
    throw new NotFoundError(`API Product '${productName}' not found in organization '${org}'`);
  }

  res.json(product);
});

export default router;
