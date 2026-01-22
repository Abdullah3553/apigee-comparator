import { Router, Request, Response } from 'express';
import { loadData } from '../data/loader';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

interface Keystore {
  name: string;
  aliases: string[];
  certs: string[];
}

interface CertificateAlias {
  alias: string;
  type: string;
  format: string;
  certificate: string;
}

interface KeystoresData {
  keystores: Keystore[];
  aliases: Record<string, CertificateAlias[]>;
}

// GET /v1/organizations/:org/environments/:env/keystores - List keystores
router.get('/', (req: Request, res: Response) => {
  const { env } = req.params;
  const data = loadData<KeystoresData>(`${env}/keystores.json`);
  res.json(data.keystores.map(k => k.name));
});

// GET /v1/organizations/:org/environments/:env/keystores/:name - Get keystore details
router.get('/:name', (req: Request, res: Response) => {
  const { env, name } = req.params;
  const data = loadData<KeystoresData>(`${env}/keystores.json`);

  const keystore = data.keystores.find(k => k.name === name);
  if (!keystore) {
    throw new NotFoundError(`Keystore '${name}' not found in environment '${env}'`);
  }

  res.json(keystore);
});

// GET /v1/organizations/:org/environments/:env/keystores/:name/aliases/:alias - Get certificate (PEM)
router.get('/:name/aliases/:alias', (req: Request, res: Response) => {
  const { env, name, alias } = req.params;
  const data = loadData<KeystoresData>(`${env}/keystores.json`);

  const aliasData = data.aliases[name]?.find(a => a.alias === alias);
  if (!aliasData) {
    throw new NotFoundError(`Alias '${alias}' not found in keystore '${name}'`);
  }

  res.json(aliasData);
});

export default router;
