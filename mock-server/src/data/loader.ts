import * as fs from 'fs';
import * as path from 'path';
import { log } from '../middleware/logger';

// Cache for loaded JSON data
const dataCache = new Map<string, any>();

// File watchers for hot-reload
const watchers = new Map<string, fs.FSWatcher>();
let watchEnabled = false;

/**
 * Load JSON data from file with caching
 * @param relativePath Path relative to the data directory (e.g., 'dev/apps.json')
 * @returns Parsed JSON data
 */
export function loadData<T>(relativePath: string): T {
  // Check cache first
  if (dataCache.has(relativePath)) {
    log.debug(`Loading ${relativePath} from cache`);
    return dataCache.get(relativePath) as T;
  }

  // Load from file
  const dataDir = path.join(__dirname, '../../data');
  const filePath = path.join(dataDir, relativePath);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Cache the data
    dataCache.set(relativePath, data);
    log.debug(`Loaded and cached ${relativePath}`);

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Failed to load ${relativePath}`, error);
    }
    throw new Error(`Failed to load mock data: ${relativePath}`);
  }
}

/**
 * Clear the data cache (useful for hot-reload in development)
 */
export function clearCache(): void {
  dataCache.clear();
  log.info('Data cache cleared');
}

/**
 * Reload a specific file from disk
 */
export function reloadData(relativePath: string): void {
  dataCache.delete(relativePath);
  log.debug(`Cache cleared for ${relativePath}`);
}

/**
 * Enable hot-reload watching for all data files
 */
export function enableHotReload(): void {
  if (watchEnabled) {
    log.info('Hot-reload already enabled');
    return;
  }

  const dataDir = path.join(__dirname, '../../data');

  try {
    // Watch the entire data directory recursively
    const watcher = fs.watch(dataDir, { recursive: true }, (eventType, filename) => {
      if (!filename || !filename.endsWith('.json')) {
        return;
      }

      log.info(`Data file changed: ${filename} (${eventType})`);

      // Clear the cache for the changed file
      dataCache.delete(filename);
      log.info(`Cache cleared for ${filename} - will reload on next request`);
    });

    watchers.set('data-directory', watcher);
    watchEnabled = true;
    log.info('Hot-reload enabled for mock data files');
  } catch (error) {
    log.error('Failed to enable hot-reload', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Disable hot-reload watching
 */
export function disableHotReload(): void {
  watchers.forEach((watcher) => {
    watcher.close();
  });
  watchers.clear();
  watchEnabled = false;
  log.info('Hot-reload disabled');
}
