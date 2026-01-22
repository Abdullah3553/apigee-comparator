/**
 * Additional OpenAPI path definitions for all routes
 * This supplements the JSDoc annotations in route files
 */

export const additionalPaths = {
  '/v1/organizations/{org}/apiproducts': {
    get: {
      tags: ['API Products'],
      summary: 'List API products',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string', example: 'mock-org' } },
        { in: 'query', name: 'expand', schema: { type: 'string', enum: ['true', 'false'] } }
      ],
      responses: { '200': { description: 'List of API products' } }
    }
  },
  '/v1/organizations/{org}/apiproducts/{productName}': {
    get: {
      tags: ['API Products'],
      summary: 'Get API product details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'productName', required: true, schema: { type: 'string', example: 'payment-api-product' } }
      ],
      responses: { '200': { description: 'API product details' } }
    }
  },
  '/v1/organizations/{org}/apps/{appId}': {
    get: {
      tags: ['Apps'],
      summary: 'Get app details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'appId', required: true, schema: { type: 'string', example: 'app-001' } }
      ],
      responses: { '200': { description: 'App details' } }
    }
  },
  '/v1/organizations/{org}/apis': {
    get: {
      tags: ['API Proxies'],
      summary: 'List API proxies',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of API proxy names' } }
    }
  },
  '/v1/organizations/{org}/apis/{apiName}': {
    get: {
      tags: ['API Proxies'],
      summary: 'Get API proxy details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'apiName', required: true, schema: { type: 'string', example: 'payment-api-v1' } }
      ],
      responses: { '200': { description: 'API proxy details' } }
    }
  },
  '/v1/organizations/{org}/apis/{apiName}/deployments': {
    get: {
      tags: ['API Proxies'],
      summary: 'Get API proxy deployments',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'apiName', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'Deployment status' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/caches': {
    get: {
      tags: ['Caches'],
      summary: 'List caches',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string', example: 'dev' } }
      ],
      responses: { '200': { description: 'List of cache names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/caches/{cacheName}': {
    get: {
      tags: ['Caches'],
      summary: 'Get cache details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'cacheName', required: true, schema: { type: 'string', example: 'session-cache' } }
      ],
      responses: { '200': { description: 'Cache details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/keyvaluemaps': {
    get: {
      tags: ['KVMs'],
      summary: 'List key-value maps',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of KVM names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}': {
    get: {
      tags: ['KVMs'],
      summary: 'Get KVM details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'kvmName', required: true, schema: { type: 'string', example: 'app-config' } }
      ],
      responses: { '200': { description: 'KVM details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/targetservers': {
    get: {
      tags: ['Target Servers'],
      summary: 'List target servers',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of target server names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/targetservers/{name}': {
    get: {
      tags: ['Target Servers'],
      summary: 'Get target server details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'name', required: true, schema: { type: 'string', example: 'payment-backend' } }
      ],
      responses: { '200': { description: 'Target server details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/references': {
    get: {
      tags: ['References'],
      summary: 'List references',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of reference names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/references/{refName}': {
    get: {
      tags: ['References'],
      summary: 'Get reference details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'refName', required: true, schema: { type: 'string', example: 'api-gateway-keystore' } }
      ],
      responses: { '200': { description: 'Reference details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/keystores': {
    get: {
      tags: ['Keystores'],
      summary: 'List keystores',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of keystore names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/keystores/{name}': {
    get: {
      tags: ['Keystores'],
      summary: 'Get keystore details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'name', required: true, schema: { type: 'string', example: 'api-gateway-certs' } }
      ],
      responses: { '200': { description: 'Keystore details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/keystores/{name}/aliases/{alias}': {
    get: {
      tags: ['Keystores'],
      summary: 'Get certificate alias',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'name', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'alias', required: true, schema: { type: 'string', example: 'api-gateway-cert' } }
      ],
      responses: { '200': { description: 'Certificate details' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/virtualhosts': {
    get: {
      tags: ['Virtual Hosts'],
      summary: 'List virtual hosts',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'List of virtual host names' } }
    }
  },
  '/v1/organizations/{org}/environments/{env}/virtualhosts/{vhName}': {
    get: {
      tags: ['Virtual Hosts'],
      summary: 'Get virtual host details',
      parameters: [
        { in: 'path', name: 'org', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'env', required: true, schema: { type: 'string' } },
        { in: 'path', name: 'vhName', required: true, schema: { type: 'string', example: 'default' } }
      ],
      responses: { '200': { description: 'Virtual host details' } }
    }
  }
};
