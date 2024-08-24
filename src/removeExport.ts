import ts from 'typescript';
import { FileService } from './FileService.js';

const findFirstNodeOfKind = (root: ts.Node, kind: ts.SyntaxKind) => {
  let result: ts.Node | undefined;
  const visitor = (node: ts.Node) => {
    if (result) {
      return;
    }

    if (node.kind === kind) {
      result = node;
      return;
    }
    ts.forEachChild(node, visitor);
  };

  ts.forEachChild(root, visitor);

  return result;
};

const IGNORE_COMMENT = 'ts-remove-unused-skip';

const getLeadingComment = (node: ts.Node) => {
  const sourceFile = node.getSourceFile();
  const fullText = sourceFile.getFullText();
  const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());

  if (!ranges) {
    return '';
  }

  return ranges.map((range) => fullText.slice(range.pos, range.end)).join('');
};

const isTargetVariableStatement = (
  node: ts.Node,
): node is ts.VariableStatement => {
  if (!ts.isVariableStatement(node)) {
    return false;
  }

  const hasExportKeyword = !!findFirstNodeOfKind(
    node,
    ts.SyntaxKind.ExportKeyword,
  );

  if (!hasExportKeyword) {
    return false;
  }

  const leadingComment = getLeadingComment(node);

  if (leadingComment.includes(IGNORE_COMMENT)) {
    return false;
  }

  return true;
};

const findReferences = (
  node: ts.VariableStatement,
  service: ts.LanguageService,
) => {
  const variableDeclaration = findFirstNodeOfKind(
    node,
    ts.SyntaxKind.VariableDeclaration,
  );

  if (!variableDeclaration) {
    return undefined;
  }

  const references = service.findReferences(
    node.getSourceFile().fileName,
    variableDeclaration.getStart(),
  );

  return references;
};

const getFirstUnusedExport = (
  sourceFile: ts.SourceFile,
  service: ts.LanguageService,
) => {
  let result: ts.VariableStatement | undefined;

  const visit = (node: ts.Node) => {
    if (result) {
      return;
    }

    if (isTargetVariableStatement(node)) {
      const references = findReferences(node, service);

      // there will be at least one reference, the declaration itself
      if (references && references.length === 1) {
        result = node;
        return;
      }
    }

    node.forEachChild(visit);
  };

  sourceFile.forEachChild(visit);

  return result;
};

function* getUnusedExportWhileExists(
  service: ts.LanguageService,
  file: string,
) {
  let prev: ts.VariableStatement | undefined;

  do {
    const program = service.getProgram();

    if (!program) {
      throw new Error('program not found');
    }

    const sourceFile = program.getSourceFile(file);

    if (!sourceFile) {
      throw new Error('source file not found');
    }

    const firstExport = getFirstUnusedExport(sourceFile, service);

    prev = firstExport;

    if (firstExport) {
      yield firstExport;
    }
  } while (prev);
}

export const removeExport = ({
  fileService,
  targetFile,
  languageService,
}: {
  fileService: FileService;
  targetFile: string;
  languageService: ts.LanguageService;
}) => {
  for (const item of getUnusedExportWhileExists(languageService, targetFile)) {
    const exportKeyword = findFirstNodeOfKind(
      item,
      ts.SyntaxKind.ExportKeyword,
    );

    if (!exportKeyword) {
      throw new Error('export keyword not found');
    }

    const content = item.getSourceFile().getFullText();

    const start = exportKeyword.getStart();
    const end = exportKeyword.getEnd();

    const newContent = `${content.slice(0, start)}${content.slice(end)}`;

    fileService.set(targetFile, newContent);
  }
};