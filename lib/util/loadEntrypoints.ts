import path from 'node:path';
import type ts from 'typescript';
import { FileService } from './FileService.js';
import escapeStringRegexp from 'escape-string-regexp';

// circular references https://github.com/microsoft/TypeScript/issues/3496#issuecomment-128553540
type PackageJsonExports = string | PackageJsonExportsObject;
interface PackageJsonExportsObject {
  [x: string]: PackageJsonExports;
}

interface PackageJson {
  // https://nodejs.org/api/packages.html#package-entry-points
  // https://nodejs.org/api/packages.html#conditional-exports
  bin?: string;
  main?: string;
  exports?: PackageJsonExports;
}

function findPackageJsonExportsEntries(
  exports: PackageJsonExports,
  results: string[],
): void {
  if (typeof exports === 'string') results.push(exports);
  if (exports !== null && typeof exports === 'object')
    for (const value of Object.values(exports))
      findPackageJsonExportsEntries(value, results);
}

export const loadEntrypoints = ({
  options,
  fileService,
}: {
  options: ts.CompilerOptions;
  fileService: FileService;
}): RegExp[] => {
  if (!options.outDir || !options.rootDir) return [];

  const packageJson = JSON.parse(
    fileService.get('/package.json'),
  ) as PackageJson;

  const entries = [];

  if (packageJson.bin) entries.push(packageJson.bin);
  if (packageJson.main) entries.push(packageJson.main);
  if (packageJson.exports)
    findPackageJsonExportsEntries(packageJson.exports, entries);

  const outDir = path.basename(options.outDir);

  return entries.map((entry) => {
    const ext = path.extname(entry);

    const relativePath = path.relative(outDir, entry);
    const rootDirRelative = path.join(options.rootDir!, relativePath);

    // remove extension
    const dirname = path.dirname(rootDirRelative);
    const base = path.basename(rootDirRelative, ext);

    const fullPathNoExt = path.join(dirname, base);

    return new RegExp(
      `^${escapeStringRegexp(fullPathNoExt)}\\.(js|jsx|ts|tsx|mjs|mts)$`,
    );
  });
};
