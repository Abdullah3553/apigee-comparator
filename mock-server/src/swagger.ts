import swaggerJsdoc from 'swagger-jsdoc';
import { additionalPaths } from './swagger-paths';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apigee Mock Management Server API',
      version: '1.0.0',
      description: 'Mock implementation of Apigee Edge Management API for local development',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Use username: mock, password: mock'
        }
      },
      schemas: {
        Organization: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'mock-org' },
            displayName: { type: 'string', example: 'Mock Organization' },
            type: { type: 'string', example: 'paid' },
            createdAt: { type: 'number', example: 1640000000000 },
            createdBy: { type: 'string', example: 'admin@mock.com' },
            lastModifiedAt: { type: 'number', example: 1700000000000 },
            lastModifiedBy: { type: 'string', example: 'admin@mock.com' },
            environments: {
              type: 'array',
              items: { type: 'string' },
              example: ['dev', 'staging']
            }
          }
        },
        Environment: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'dev' },
            createdAt: { type: 'number' },
            createdBy: { type: 'string' },
            lastModifiedAt: { type: 'number' },
            lastModifiedBy: { type: 'string' }
          }
        },
        App: {
          type: 'object',
          properties: {
            appId: { type: 'string', example: 'app-001' },
            name: { type: 'string', example: 'partner-portal-app' },
            accessType: { type: 'string', example: 'read' },
            status: { type: 'string', example: 'approved' },
            developerId: { type: 'string' },
            callbackUrl: { type: 'string' },
            credentials: { type: 'array', items: { type: 'object' } }
          }
        },
        ApiProduct: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'payment-api-product' },
            displayName: { type: 'string', example: 'Payment API Product' },
            description: { type: 'string' },
            approvalType: { type: 'string', example: 'auto' },
            environments: { type: 'array', items: { type: 'string' } },
            proxies: { type: 'array', items: { type: 'string' } },
            quota: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Resource not found' }
          }
        }
      }
    },
    security: [{ basicAuth: [] }],
    tags: [
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Environments', description: 'Environment management' },
      { name: 'Apps', description: 'Developer Apps' },
      { name: 'API Products', description: 'API Product bundles' },
      { name: 'API Proxies', description: 'API Proxy management' },
      { name: 'Caches', description: 'Cache resources' },
      { name: 'KVMs', description: 'Key-Value Maps' },
      { name: 'Target Servers', description: 'Backend target servers' },
      { name: 'References', description: 'References to resources' },
      { name: 'Keystores', description: 'TLS/SSL keystores and certificates' },
      { name: 'Virtual Hosts', description: 'Virtual host configurations' }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

const generatedSpec = swaggerJsdoc(options) as any;

// Merge additional paths
export const swaggerSpec = {
  ...generatedSpec,
  paths: {
    ...(generatedSpec.paths || {}),
    ...additionalPaths
  }
};
