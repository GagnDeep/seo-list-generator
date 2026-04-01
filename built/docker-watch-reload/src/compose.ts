import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
import { resolve } from 'path';

export interface ComposeService {
  name: string;
  build?: {
    context?: string;
    dockerfile?: string;
  };
  volumes?: string[];
  image?: string;
}

export interface ParsedCompose {
  services: Map<string, ComposeService>;
  serviceNames: string[];
  /** Absolute path to the directory containing the compose file */
  baseDir: string;
}

/**
 * Parse a docker-compose.yml file and extract service information.
 * @param composePath - Path to docker-compose.yml
 * @returns ParsedCompose with service name-to-info mapping
 */
export function parseCompose(composePath: string): ParsedCompose {
  const raw = readFileSync(composePath, 'utf-8');
  const doc = yamlLoad(raw) as Record<string, unknown>;

  if (!doc || typeof doc !== 'object' || !('services' in doc)) {
    throw new Error(`Invalid docker-compose.yml: no "services" key found`);
  }

  const servicesRecord = doc['services'] as Record<string, unknown>;
  const services = new Map<string, ComposeService>();

  for (const [name, serviceDef] of Object.entries(servicesRecord)) {
    const def = serviceDef as Record<string, unknown>;
    const service: ComposeService = { name };

    if (def['build']) {
      if (typeof def['build'] === 'string') {
        service.build = { context: def['build'] as string };
      } else if (typeof def['build'] === 'object' && def['build'] !== null) {
        const build = def['build'] as Record<string, unknown>;
        service.build = {
          context: (build['context'] as string) || './',
          dockerfile: build['dockerfile'] as string | undefined,
        };
      }
    }

    if (def['volumes']) {
      service.volumes = (def['volumes'] as string[]).filter(
        (v) => !v.startsWith('/') && !v.includes(':'), // skip bind mounts with absolute paths
      );
    }

    if (def['image']) {
      service.image = def['image'] as string;
    }

    services.set(name, service);
  }

  return {
    services,
    serviceNames: [...services.keys()],
    baseDir: resolve(composePath, '..'),
  };
}

/**
 * Find which services are affected by a changed file path.
 * Returns service names whose build context or volume source matches the file.
 */
export function getAffectedServices(
  changedPath: string,
  services: Map<string, ComposeService>,
  baseDir: string,
): string[] {
  const affected: string[] = [];
  const changed = resolve(changedPath);

  for (const [name, service] of services) {
    // If service has a build context, check if changed file is within it
    if (service.build) {
      const context = resolve(baseDir, service.build.context || './');
      if (
        changed.startsWith(context + '/') ||
        changed === context
      ) {
        affected.push(name);
        continue;
      }
    }

    // If service has named volumes, check if changed file is in a volume source
    if (service.volumes && service.volumes.length > 0) {
      for (const vol of service.volumes) {
        // vol is like "./src:/app/src" — extract source part
        const source = vol.split(':')[0];
        if (!source.startsWith('/')) {
          const volPath = resolve(baseDir, source);
          if (changed.startsWith(volPath + '/') || changed === volPath) {
            affected.push(name);
            break;
          }
        }
      }
    }
  }

  return affected;
}
