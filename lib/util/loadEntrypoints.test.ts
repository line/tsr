import { describe, it } from 'node:test';
import { MemoryFileService } from './MemoryFileService.js';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { loadEntrypoints } from './loadEntrypoints.js';

describe('loadEntrypoints', () => {
  it('should load entrypoints from package.json using tsconfig as reference', async () => {
    const options: ts.CompilerOptions = {
      rootDir: '/src',
      outDir: '/dist',
    };
    const fileService = new MemoryFileService();
    fileService.set(
      '/package.json',
      JSON.stringify({
        bin: './dist/cli.js',
        main: './dist/index.js',
        exports: { '.': 'dist/default-export.js' },
      }),
    );
    fileService.set(
      '/src/index.ts',
      `export const a = 'a'; export const a2 = 'a2';`,
    );
    assert.deepEqual(loadEntrypoints({ options, fileService }), [
      new RegExp(/^\/src\/cli\.(js|jsx|ts|tsx|mjs|mts)$/),
      new RegExp(/^\/src\/index\.(js|jsx|ts|tsx|mjs|mts)$/),
      new RegExp(/^\/src\/default\x2dexport\.(js|jsx|ts|tsx|mjs|mts)$/),
    ]);
  });
});
