import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  target: 'node18',
  banner: ({ format }) => {
    if (format === 'cjs') return { js: '#!/usr/bin/env node' };
    return {};
  },
});
