"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCompose = parseCompose;
exports.getAffectedServices = getAffectedServices;
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
/**
 * Parse a docker-compose.yml file and extract service information.
 * @param composePath - Path to docker-compose.yml
 * @returns ParsedCompose with service name-to-info mapping
 */
function parseCompose(composePath) {
    const raw = (0, fs_1.readFileSync)(composePath, 'utf-8');
    const doc = (0, js_yaml_1.load)(raw);
    if (!doc || typeof doc !== 'object' || !('services' in doc)) {
        throw new Error(`Invalid docker-compose.yml: no "services" key found`);
    }
    const servicesRecord = doc['services'];
    const services = new Map();
    for (const [name, serviceDef] of Object.entries(servicesRecord)) {
        const def = serviceDef;
        const service = { name };
        if (def['build']) {
            if (typeof def['build'] === 'string') {
                service.build = { context: def['build'] };
            }
            else if (typeof def['build'] === 'object' && def['build'] !== null) {
                const build = def['build'];
                service.build = {
                    context: build['context'] || './',
                    dockerfile: build['dockerfile'],
                };
            }
        }
        if (def['volumes']) {
            service.volumes = def['volumes'].filter((v) => !v.startsWith('/') && !v.includes(':'));
        }
        if (def['image']) {
            service.image = def['image'];
        }
        services.set(name, service);
    }
    return {
        services,
        serviceNames: [...services.keys()],
        baseDir: (0, path_1.resolve)(composePath, '..'),
    };
}
/**
 * Find which services are affected by a changed file path.
 * Returns service names whose build context or volume source matches the file.
 */
function getAffectedServices(changedPath, services, baseDir) {
    const affected = [];
    const changed = (0, path_1.resolve)(changedPath);
    for (const [name, service] of services) {
        // If service has a build context, check if changed file is within it
        if (service.build) {
            const context = (0, path_1.resolve)(baseDir, service.build.context || './');
            if (changed.startsWith(context + '/') ||
                changed === context) {
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
                    const volPath = (0, path_1.resolve)(baseDir, source);
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
//# sourceMappingURL=compose.js.map