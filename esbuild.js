import { build } from 'esbuild';

build({
  entryPoints: ['lib/cli.ts'],
  outdir: 'dist',
  bundle: true,
  external: ['chalk', 'cac', 'typescript'],
  target: 'node18',
  platform: 'node',
  format: 'esm',
  tsconfig: 'tsconfig.lib.json',
});
