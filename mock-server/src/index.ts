import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { enableHotReload } from './data/loader';

const app = express();
const PORT = process.env.MOCK_SERVER_PORT || 8080;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ENABLE_HOT_RELOAD = process.env.ENABLE_HOT_RELOAD === 'true' || process.env.NODE_ENV === 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(LOG_LEVEL === 'debug' ? 'dev' : 'combined'));

// Swagger UI (no auth required)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Apigee Mock API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// Serve OpenAPI spec as JSON (no auth required)
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Authentication
app.use(authMiddleware);

// Import routes
import organizationsRouter from './routes/organizations';
import environmentsRouter from './routes/environments';
import appsRouter from './routes/apps';
import apiProductsRouter from './routes/apiProducts';
import apiProxiesRouter from './routes/apiProxies';
import cachesRouter from './routes/caches';
import kvmsRouter from './routes/kvms';
import targetServersRouter from './routes/targetServers';
import referencesRouter from './routes/references';
import keystoresRouter from './routes/keystores';
import virtualHostsRouter from './routes/virtualHosts';

// Register routes
app.use('/v1/organizations', organizationsRouter);
app.use('/v1/organizations/:org/environments', environmentsRouter);
app.use('/v1/organizations/:org/apps', appsRouter);
app.use('/v1/organizations/:org/apiproducts', apiProductsRouter);
app.use('/v1/organizations/:org/apis', apiProxiesRouter);
app.use('/v1/organizations/:org/environments/:env/caches', cachesRouter);
app.use('/v1/organizations/:org/environments/:env/keyvaluemaps', kvmsRouter);
app.use('/v1/organizations/:org/environments/:env/targetservers', targetServersRouter);
app.use('/v1/organizations/:org/environments/:env/references', referencesRouter);
app.use('/v1/organizations/:org/environments/:env/keystores', keystoresRouter);
app.use('/v1/organizations/:org/environments/:env/virtualhosts', virtualHostsRouter);

// Health check endpoint (no auth required)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'apigee-mock-server' });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[INFO] Apigee Mock Server listening on port ${PORT}`);
    console.log(`[INFO] Log level: ${LOG_LEVEL}`);
    console.log(`[INFO] Authentication: Basic Auth (mock/mock)`);
    console.log(`[INFO] API Documentation: http://localhost:${PORT}/api-docs`);

    // Enable hot-reload in development mode
    if (ENABLE_HOT_RELOAD) {
      enableHotReload();
      console.log(`[INFO] Hot-reload enabled - mock data changes will be detected automatically`);
    }
  });
}

export default app;
