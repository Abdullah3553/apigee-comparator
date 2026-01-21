# Apigee Monitor Dashboard - Frontend

React-based dashboard for comparing Apigee configurations across environments, built with Vite, React 18, TanStack Query, and Tailwind CSS.

## Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- Backend API running (see `../backend/README.md`)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory (or edit `../.env` in project root):

```env
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001
```

**Note**: The `VITE_` prefix is required for Vite environment variables.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000

The dev server includes:
- Hot Module Replacement (HMR)
- Proxy to backend API at `/api`
- React Fast Refresh

## Available Scripts

### Development
```bash
npm run dev         # Start development server with HMR
npm run preview     # Preview production build locally
```

### Build
```bash
npm run build       # Build for production (output to dist/)
```

### Code Quality
```bash
npm run lint        # Lint code with ESLint
```

### Testing
```bash
npm test            # Run tests with Vitest
npm run test:ui     # Run tests with UI
npm run test:coverage  # Run tests with coverage report
```

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                   # Application entry point
│   ├── App.tsx                    # Root component
│   ├── index.css                  # Global styles (Tailwind)
│   ├── services/
│   │   └── api.ts                 # Axios client for backend API
│   ├── types/
│   │   ├── environment.types.ts   # Environment/config types
│   │   ├── entity.types.ts        # Entity and issue types
│   │   └── comparison.types.ts    # Comparison result types
│   ├── hooks/                     # Custom React hooks (TanStack Query)
│   ├── components/                # React components
│   │   ├── NavBar/
│   │   ├── EnvSelector/
│   │   ├── ComparisonView/
│   │   └── common/
│   ├── contexts/                  # React Context providers
│   └── utils/                     # Utility functions
├── public/                        # Static assets
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

## Environment Variables

### Development

Create `.env` or `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Production

For production builds, set the backend API URL:

```env
VITE_API_BASE_URL=https://your-backend-api-domain.com
```

**Important**: Always prefix environment variables with `VITE_` for Vite to expose them to the browser.

## Configuration

### API Base URL

The frontend connects to the backend API via the URL specified in `VITE_API_BASE_URL`.

During development, Vite proxy forwards `/api` requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### Tailwind CSS

Customize styling in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      // Add custom colors, fonts, etc.
    },
  },
}
```

### TanStack Query

Query client is configured in `src/main.tsx` with:
- 5-minute stale time for cached data
- Disabled automatic refetch on window focus
- Single retry on failure
- React Query Devtools enabled in development

## Features

### Current (Phase 2 - Foundation)
- ✅ React 18 with TypeScript
- ✅ Vite for fast development and optimized builds
- ✅ TanStack Query for server state management
- ✅ Tailwind CSS for styling
- ✅ Axios for API communication
- ✅ TypeScript types for all data models
- ✅ Basic app layout with navigation

### Coming Soon (Phase 3+)
- 🚧 Environment selection with cascading dropdowns
- 🚧 Side-by-side comparison view
- 🚧 Entity type filtering
- 🚧 Drill-down into nested data
- 🚧 Issue highlighting (expired certs, revoked apps)
- 🚧 Refresh functionality
- 🚧 Single environment view mode

## Component Architecture

### State Management

**Server State (TanStack Query)**:
- Configuration data
- Environment lists
- Entity data
- Comparison results

**UI State (React Context)**:
- Selected environments
- Selected entity type
- View mode (comparison vs. single)

### Custom Hooks

All API calls are abstracted into custom hooks:

```typescript
// Example hook structure
export const useEnvironments = () => {
  return useQuery({
    queryKey: ['environments'],
    queryFn: async () => {
      const { data } = await api.get('/config/environments');
      return data;
    },
  });
};
```

## Styling Guidelines

### Tailwind CSS Classes

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-white shadow-md">
  <h1 className="text-xl font-bold text-gray-900">Title</h1>
</div>
```

### Responsive Design

Use Tailwind responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Docker Deployment

### Development Build
```bash
docker build --target development -t apigee-monitor-frontend:dev .
docker run -p 3000:3000 apigee-monitor-frontend:dev
```

### Production Build
```bash
docker build --target production -t apigee-monitor-frontend:prod .
docker run -p 80:80 apigee-monitor-frontend:prod
```

### Docker Compose (Recommended)
From project root:

```bash
docker-compose up frontend
```

Or run full stack:

```bash
docker-compose up
```

## Troubleshooting

### Cannot Connect to Backend API

**Symptom**: Network errors or 404s when calling API

**Solutions**:
1. Verify backend is running: `curl http://localhost:3001/api/config`
2. Check `VITE_API_BASE_URL` in `.env`
3. Ensure backend CORS is enabled (already configured in NestJS)
4. Clear browser cache and restart dev server

### Hot Module Replacement Not Working

**Symptom**: Changes don't reflect in browser

**Solutions**:
1. Restart dev server: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Check for syntax errors in console
4. Ensure file extensions are `.tsx` for React components

### TypeScript Errors

**Symptom**: Type errors in IDE or build

**Solutions**:
1. Run `npm install` to ensure types are installed
2. Restart TypeScript server in IDE
3. Check `tsconfig.json` for correct configuration
4. Verify all type definition files exist in `src/types/`

### Build Errors

**Symptom**: `npm run build` fails

**Solutions**:
1. Fix all TypeScript errors first
2. Check for missing dependencies: `npm install`
3. Clear build cache: `rm -rf dist node_modules && npm install`
4. Verify `vite.config.ts` is correct

### Tailwind Styles Not Applied

**Symptom**: Tailwind classes don't work

**Solutions**:
1. Verify `tailwind.config.js` includes correct content paths
2. Ensure `@tailwind` directives exist in `src/index.css`
3. Restart dev server after config changes
4. Check browser console for CSS loading errors

## Development Tips

### Browser DevTools

**TanStack Query Devtools**: Available in development mode (bottom-left corner). Shows:
- Active queries and their state
- Cached data
- Query invalidation status
- Refetch controls

**React DevTools**: Install browser extension for:
- Component tree inspection
- Props and state debugging
- Performance profiling

### API Testing

Test backend API separately before integrating:

```bash
# Get environments
curl http://localhost:3001/api/config/environments

# Get configuration
curl http://localhost:3001/api/config
```

### Hot Reload

Vite's HMR preserves component state across code changes. To force a full reload:
- Edit `src/main.tsx`
- Or manually refresh browser (Ctrl+R or Cmd+R)

### Performance

**Lazy Loading** (coming in Phase 10):
```tsx
const ComparisonView = lazy(() => import('./components/ComparisonView'));
```

**Code Splitting**: Vite automatically splits code by route.

**Image Optimization**: Place images in `public/` for static serving.

## Testing

### Unit Tests (Vitest)

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText(/Apigee Monitor/i)).toBeInTheDocument();
  });
});
```

## Building for Production

### Build Command
```bash
npm run build
```

Output in `dist/`:
```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── index.html
```

### Preview Production Build
```bash
npm run preview
```

Access at http://localhost:4173

### Deploy

Production bundle can be deployed to:
- **Static hosting**: Netlify, Vercel, AWS S3 + CloudFront
- **Docker**: Use production Dockerfile stage with nginx
- **Kubernetes**: Deploy as nginx container

Ensure `VITE_API_BASE_URL` points to production backend API.

## Next Steps

1. Ensure backend is running (see `../backend/README.md`)
2. Start frontend dev server: `npm run dev`
3. Open http://localhost:3000
4. Verify placeholder dashboard appears
5. Check TanStack Query devtools in bottom-left corner
6. Implementation continues in Phase 3+ (environment selection, comparison, etc.)

## Support

For issues or questions:
- Check the main project [README.md](../README.md)
- Review [quickstart.md](../specs/001-apigee-monitor-dashboard/quickstart.md)
- See [plan.md](../specs/001-apigee-monitor-dashboard/plan.md) for architecture details
