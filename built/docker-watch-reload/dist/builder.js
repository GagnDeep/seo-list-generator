"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAndRestart = buildAndRestart;
exports.buildMultiple = buildMultiple;
exports.isDockerAvailable = isDockerAvailable;
const child_process_1 = require("child_process");
const util_1 = require("util");
const picocolors_1 = __importDefault(require("picocolors"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const EXEC_OPTIONS = { timeout: 300_000 }; // 5 minute timeout for builds
/**
 * Rebuild and restart a specific Docker Compose service.
 */
async function buildAndRestart(serviceName, composeFile, verbose) {
    const flag = ['-f', composeFile];
    if (verbose) {
        console.log(picocolors_1.default.cyan(`  → Building ${serviceName}...`));
    }
    try {
        // Build the service
        const buildCmd = execFileAsync('docker', ['compose', ...flag, 'build', serviceName], EXEC_OPTIONS);
        const { stdout: buildOut, stderr: buildErr } = await buildCmd;
        if (verbose && buildOut) {
            console.log(picocolors_1.default.gray(`  [build] ${buildOut.trim().split('\n').slice(-3).join('\n  ')}`));
        }
        if (buildErr && verbose) {
            console.log(picocolors_1.default.gray(`  [build err] ${buildErr.trim()}`));
        }
        // Restart the service
        const upCmd = execFileAsync('docker', ['compose', ...flag, 'up', '-d', '--no-deps', serviceName], EXEC_OPTIONS);
        const { stdout: upOut } = await upCmd;
        return { success: true, output: buildOut + upOut };
    }
    catch (err) {
        const error = err;
        return {
            success: false,
            output: error.stderr || error.message || String(err),
        };
    }
}
/**
 * Rebuild and restart multiple services.
 */
async function buildMultiple(serviceNames, composeFile, verbose) {
    const results = new Map();
    // Build all at once (docker compose build is parallel)
    const flag = ['-f', composeFile];
    if (verbose) {
        console.log(picocolors_1.default.cyan(`  → Building: ${serviceNames.join(', ')}...`));
    }
    try {
        await execFileAsync('docker', ['compose', ...flag, 'build', ...serviceNames], EXEC_OPTIONS);
    }
    catch (err) {
        const error = err;
        console.error(picocolors_1.default.red(`  Build failed: ${error.stderr || String(err)}`));
        for (const s of serviceNames)
            results.set(s, false);
        return results;
    }
    // Restart services sequentially to avoid port conflicts
    for (const name of serviceNames) {
        try {
            await execFileAsync('docker', ['compose', ...flag, 'up', '-d', '--no-deps', name], EXEC_OPTIONS);
            results.set(name, true);
            if (verbose) {
                console.log(picocolors_1.default.green(`  ✓ ${name} restarted`));
            }
        }
        catch (err) {
            const error = err;
            console.error(picocolors_1.default.red(`  ✗ ${name} restart failed: ${error.stderr || String(err)}`));
            results.set(name, false);
        }
    }
    return results;
}
/**
 * Check if docker compose is available.
 */
async function isDockerAvailable() {
    try {
        await execFileAsync('docker', ['compose', 'version']);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=builder.js.map