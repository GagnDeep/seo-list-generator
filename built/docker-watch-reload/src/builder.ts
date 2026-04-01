import { execFile } from 'child_process';
import { promisify } from 'util';
import picocolors from 'picocolors';

const execFileAsync = promisify(execFile);

export interface ServiceInfo {
  name: string;
  hasBuild: boolean;
}

const EXEC_OPTIONS = { timeout: 300_000 }; // 5 minute timeout for builds

/**
 * Rebuild and restart a specific Docker Compose service.
 */
export async function buildAndRestart(
  serviceName: string,
  composeFile: string,
  verbose: boolean,
): Promise<{ success: boolean; output: string }> {
  const flag = ['-f', composeFile];

  if (verbose) {
    console.log(
      picocolors.cyan(`  → Building ${serviceName}...`),
    );
  }

  try {
    // Build the service
    const buildCmd = execFileAsync('docker', ['compose', ...flag, 'build', serviceName], EXEC_OPTIONS);
    const { stdout: buildOut, stderr: buildErr } = await buildCmd;

    if (verbose && buildOut) {
      console.log(picocolors.gray(`  [build] ${buildOut.trim().split('\n').slice(-3).join('\n  ')}`));
    }
    if (buildErr && verbose) {
      console.log(picocolors.gray(`  [build err] ${buildErr.trim()}`));
    }

    // Restart the service
    const upCmd = execFileAsync(
      'docker',
      ['compose', ...flag, 'up', '-d', '--no-deps', serviceName],
      EXEC_OPTIONS,
    );
    const { stdout: upOut } = await upCmd;

    return { success: true, output: buildOut + upOut };
  } catch (err: unknown) {
    const error = err as { message?: string; stderr?: string };
    return {
      success: false,
      output: error.stderr || error.message || String(err),
    };
  }
}

/**
 * Rebuild and restart multiple services.
 */
export async function buildMultiple(
  serviceNames: string[],
  composeFile: string,
  verbose: boolean,
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  // Build all at once (docker compose build is parallel)
  const flag = ['-f', composeFile];

  if (verbose) {
    console.log(picocolors.cyan(`  → Building: ${serviceNames.join(', ')}...`));
  }

  try {
    await execFileAsync(
      'docker',
      ['compose', ...flag, 'build', ...serviceNames],
      EXEC_OPTIONS,
    );
  } catch (err: unknown) {
    const error = err as { stderr?: string };
    console.error(picocolors.red(`  Build failed: ${error.stderr || String(err)}`));
    for (const s of serviceNames) results.set(s, false);
    return results;
  }

  // Restart services sequentially to avoid port conflicts
  for (const name of serviceNames) {
    try {
      await execFileAsync(
        'docker',
        ['compose', ...flag, 'up', '-d', '--no-deps', name],
        EXEC_OPTIONS,
      );
      results.set(name, true);
      if (verbose) {
        console.log(picocolors.green(`  ✓ ${name} restarted`));
      }
    } catch (err: unknown) {
      const error = err as { stderr?: string };
      console.error(picocolors.red(`  ✗ ${name} restart failed: ${error.stderr || String(err)}`));
      results.set(name, false);
    }
  }

  return results;
}

/**
 * Check if docker compose is available.
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    await execFileAsync('docker', ['compose', 'version']);
    return true;
  } catch {
    return false;
  }
}
