import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisResult {
  language: string;
  framework?: string;
  totalFiles: number;
  totalLines: number;
  codeFiles: number;
  testFiles: number;
  folderDistribution: Record<string, number>;
  fileTypes: Record<string, number>;
  largestFiles: Array<{ path: string; lines: number }>;
  warnings: string[];
  suggestions: string[];
  dependencies?: {
    total: number;
    outdated?: number;
  };
}

export function analyzeProject(rootDir: string): AnalysisResult {
  const result: AnalysisResult = {
    language: 'Unknown',
    totalFiles: 0,
    totalLines: 0,
    codeFiles: 0,
    testFiles: 0,
    folderDistribution: {},
    fileTypes: {},
    largestFiles: [],
    warnings: [],
    suggestions: [],
  };

  const ignorePatterns = ['node_modules', 'dist', '.git', 'build', '.next', 'coverage'];
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'];
  const testPatterns = ['.test.', '.spec.', '__tests__'];

  const fileSizes: Array<{ path: string; lines: number }> = [];

  function scanDirectory(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (ignorePatterns.includes(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          result.totalFiles++;
          const relativePath = path.relative(rootDir, fullPath);
          const folder = path.dirname(relativePath);
          const ext = path.extname(entry.name);

          result.folderDistribution[folder] = (result.folderDistribution[folder] || 0) + 1;
          result.fileTypes[ext] = (result.fileTypes[ext] || 0) + 1;

          if (codeExtensions.includes(ext)) {
            result.codeFiles++;
            
            if (testPatterns.some(pattern => entry.name.includes(pattern))) {
              result.testFiles++;
            }

            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const lines = content.split('\n').length;
              result.totalLines += lines;

              fileSizes.push({ path: relativePath, lines });

              if (lines > 500) {
                result.warnings.push(`Large file: ${relativePath} (${lines} lines)`);
              }
            } catch {}
          }
        }
      }
    } catch {}
  }

  scanDirectory(rootDir);

  // Get largest files
  result.largestFiles = fileSizes
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 5);

  // Detect language and framework
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    result.language = 'JavaScript/TypeScript';
    
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      result.dependencies = {
        total: Object.keys(deps).length,
      };

      if (deps['next']) result.framework = 'Next.js';
      else if (deps['react']) result.framework = 'React';
      else if (deps['express']) result.framework = 'Express';
      else if (deps['vue']) result.framework = 'Vue';

      // Check for unused dependencies
      const unusedDeps = Object.keys(deps).filter(dep => {
        // Simple check - could be enhanced
        return !['react', 'next', 'express'].includes(dep);
      });

      if (unusedDeps.length > 5) {
        result.warnings.push(`Many dependencies installed (${Object.keys(deps).length})`);
      }
    } catch {}
  } else if (fs.existsSync(path.join(rootDir, 'requirements.txt'))) {
    result.language = 'Python';
    
    try {
      const reqs = fs.readFileSync(path.join(rootDir, 'requirements.txt'), 'utf-8');
      if (reqs.includes('fastapi')) result.framework = 'FastAPI';
      else if (reqs.includes('django')) result.framework = 'Django';
      else if (reqs.includes('flask')) result.framework = 'Flask';
    } catch {}
  } else if (fs.existsSync(path.join(rootDir, 'go.mod'))) {
    result.language = 'Go';
  } else if (fs.existsSync(path.join(rootDir, 'Cargo.toml'))) {
    result.language = 'Rust';
  }

  // Generate suggestions
  if (result.largestFiles.length > 0 && result.largestFiles[0].lines > 500) {
    result.suggestions.push(`Consider splitting ${result.largestFiles[0].path} into smaller modules`);
  }

  if (result.testFiles === 0 && result.codeFiles > 0) {
    result.suggestions.push('No test files detected - consider adding tests');
  }

  const testCoverage = result.codeFiles > 0 ? (result.testFiles / result.codeFiles) * 100 : 0;
  if (testCoverage < 20 && result.codeFiles > 5) {
    result.suggestions.push(`Low test coverage (~${Math.round(testCoverage)}%) - add more tests`);
  }

  return result;
}
