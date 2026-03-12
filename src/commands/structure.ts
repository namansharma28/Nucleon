import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  extension?: string;
}

interface DependencyRelation {
  from: string;
  to: string;
  type: 'import' | 'require' | 'dynamic';
}

export function structureCommand() {
  const spinner = ora('Analyzing project structure...').start();

  try {
    const projectRoot = process.cwd();
    const structure = buildFileTree(projectRoot);
    const dependencies = analyzeDependencies(projectRoot);
    
    spinner.succeed('Structure analysis complete!');

    console.log(chalk.bold('\n🏗️  Project Structure\n'));
    printTree(structure, '', true);

    if (dependencies.length > 0) {
      console.log(chalk.bold('\n🔗 Dependency Graph Detected\n'));
      printDependencyGraph(dependencies);
    }

    // Show architecture insights
    const insights = generateArchitectureInsights(structure, dependencies);
    if (insights.length > 0) {
      console.log(chalk.bold('\n💡 Architecture Insights\n'));
      insights.forEach(insight => {
        console.log(chalk.blue('  •'), insight);
      });
    }

    console.log();
  } catch (error) {
    spinner.fail('Structure analysis failed');
    console.error((error as Error).message);
  }
}

function buildFileTree(dirPath: string, maxDepth = 4, currentDepth = 0): FileNode {
  const ignorePatterns = ['node_modules', 'dist', '.git', 'build', '.next', 'coverage', '.nuxt'];
  const name = path.basename(dirPath);

  if (currentDepth >= maxDepth) {
    return { name, type: 'directory' };
  }

  try {
    const stats = fs.statSync(dirPath);
    
    if (stats.isFile()) {
      return {
        name,
        type: 'file',
        size: stats.size,
        extension: path.extname(name),
      };
    }

    if (stats.isDirectory()) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const children: FileNode[] = [];

      for (const entry of entries) {
        if (ignorePatterns.includes(entry.name)) continue;
        
        const childPath = path.join(dirPath, entry.name);
        const childNode = buildFileTree(childPath, maxDepth, currentDepth + 1);
        children.push(childNode);
      }

      // Sort: directories first, then files
      children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return {
        name: currentDepth === 0 ? 'project' : name,
        type: 'directory',
        children,
      };
    }
  } catch {}

  return { name, type: 'directory' };
}

function printTree(node: FileNode, prefix = '', isLast = true) {
  const connector = isLast ? '└── ' : '├── ';
  const icon = getFileIcon(node);
  const color = getFileColor(node);
  
  console.log(prefix + connector + color(icon + node.name));

  if (node.children && node.children.length > 0) {
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    
    node.children.forEach((child, index) => {
      const isLastChild = index === node.children!.length - 1;
      printTree(child, newPrefix, isLastChild);
    });
  }
}

function getFileIcon(node: FileNode): string {
  if (node.type === 'directory') return '📁 ';
  
  const ext = node.extension?.toLowerCase();
  switch (ext) {
    case '.ts': case '.tsx': return '🔷 ';
    case '.js': case '.jsx': return '🟨 ';
    case '.py': return '🐍 ';
    case '.json': return '📋 ';
    case '.md': return '📝 ';
    case '.css': case '.scss': return '🎨 ';
    case '.html': return '🌐 ';
    case '.yml': case '.yaml': return '⚙️ ';
    case '.env': return '🔐 ';
    case '.gitignore': return '🚫 ';
    default: return '📄 ';
  }
}

function getFileColor(node: FileNode) {
  if (node.type === 'directory') return chalk.blue;
  
  const ext = node.extension?.toLowerCase();
  switch (ext) {
    case '.ts': case '.tsx': return chalk.blue;
    case '.js': case '.jsx': return chalk.yellow;
    case '.py': return chalk.green;
    case '.json': return chalk.cyan;
    case '.md': return chalk.white;
    case '.css': case '.scss': return chalk.magenta;
    default: return chalk.gray;
  }
}

function analyzeDependencies(projectRoot: string): DependencyRelation[] {
  const dependencies: DependencyRelation[] = [];
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];

  function scanForImports(filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(projectRoot, filePath);

      // Match import statements
      const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
      const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
      const dynamicImportRegex = /import\(['"`]([^'"`]+)['"`]\)/g;

      let match;

      // ES6 imports
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          dependencies.push({
            from: relativePath,
            to: importPath,
            type: 'import',
          });
        }
      }

      // CommonJS requires
      while ((match = requireRegex.exec(content)) !== null) {
        const requirePath = match[1];
        if (requirePath.startsWith('.')) {
          dependencies.push({
            from: relativePath,
            to: requirePath,
            type: 'require',
          });
        }
      }

      // Dynamic imports
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        const dynamicPath = match[1];
        if (dynamicPath.startsWith('.')) {
          dependencies.push({
            from: relativePath,
            to: dynamicPath,
            type: 'dynamic',
          });
        }
      }
    } catch {}
  }

  function walkDirectory(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          walkDirectory(fullPath);
        } else if (entry.isFile() && codeExtensions.includes(path.extname(entry.name))) {
          scanForImports(fullPath);
        }
      }
    } catch {}
  }

  walkDirectory(projectRoot);
  return dependencies.slice(0, 20); // Limit to prevent overwhelming output
}

function printDependencyGraph(dependencies: DependencyRelation[]) {
  const grouped = dependencies.reduce((acc, dep) => {
    if (!acc[dep.from]) acc[dep.from] = [];
    acc[dep.from].push(dep);
    return acc;
  }, {} as Record<string, DependencyRelation[]>);

  Object.entries(grouped).slice(0, 10).forEach(([file, deps]) => {
    console.log(chalk.cyan(`  ${file}`));
    deps.forEach(dep => {
      const typeIcon = dep.type === 'import' ? '→' : dep.type === 'require' ? '⟵' : '⤷';
      console.log(chalk.gray(`    ${typeIcon} ${dep.to}`));
    });
    console.log();
  });
}

function generateArchitectureInsights(structure: FileNode, dependencies: DependencyRelation[]): string[] {
  const insights: string[] = [];

  // Analyze folder structure
  const folders = getFolders(structure);
  
  if (folders.includes('components') && folders.includes('pages')) {
    insights.push('React/Next.js architecture detected with component-based structure');
  }
  
  if (folders.includes('src') && folders.includes('tests')) {
    insights.push('Well-organized project with separate source and test directories');
  }
  
  if (folders.includes('api') || folders.includes('routes')) {
    insights.push('API/Backend architecture with route organization');
  }
  
  if (folders.includes('utils') || folders.includes('helpers')) {
    insights.push('Good separation of concerns with utility functions');
  }
  
  if (folders.includes('types') || folders.includes('interfaces')) {
    insights.push('TypeScript project with dedicated type definitions');
  }

  // Analyze dependencies
  if (dependencies.length > 15) {
    insights.push('Complex dependency graph - consider modularization');
  } else if (dependencies.length > 0) {
    insights.push('Clean modular architecture with reasonable dependencies');
  }

  // Check for common patterns
  const hasConfig = folders.some(f => f.includes('config'));
  const hasMiddleware = folders.some(f => f.includes('middleware'));
  
  if (hasConfig && hasMiddleware) {
    insights.push('Enterprise-ready architecture with configuration and middleware layers');
  }

  return insights;
}

function getFolders(node: FileNode): string[] {
  const folders: string[] = [];
  
  if (node.type === 'directory' && node.children) {
    folders.push(node.name);
    node.children.forEach(child => {
      folders.push(...getFolders(child));
    });
  }
  
  return folders;
}