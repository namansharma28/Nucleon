import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export function statsCommand() {
  console.log(chalk.bold('\n📊 Project Statistics\n'));

  try {
    // Git stats
    if (fs.existsSync('.git')) {
      try {
        const commits = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
        const contributors = execSync('git shortlog -sn | wc -l', { encoding: 'utf-8' }).trim();
        const lastCommit = execSync('git log -1 --format="%cr"', { encoding: 'utf-8' }).trim();
        
        console.log(chalk.cyan('Total Commits:'), commits);
        console.log(chalk.cyan('Contributors:'), contributors);
        console.log(chalk.cyan('Last Commit:'), lastCommit);
      } catch {
        console.log(chalk.yellow('Git stats unavailable'));
      }
    }

    // Package.json stats
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      
      console.log(chalk.cyan('Dependencies:'), deps);
      console.log(chalk.cyan('Dev Dependencies:'), devDeps);
      console.log(chalk.cyan('Package Version:'), pkg.version || 'N/A');
    }

    // File system stats
    const stats = getProjectStats(process.cwd());
    console.log(chalk.cyan('Total Files:'), stats.files);
    console.log(chalk.cyan('Total Size:'), formatBytes(stats.size));
    console.log(chalk.cyan('Average File Size:'), formatBytes(stats.size / stats.files));

    console.log();
  } catch (error) {
    console.error('Failed to generate stats:', (error as Error).message);
  }
}

function getProjectStats(dir: string): { files: number; size: number } {
  let files = 0;
  let size = 0;
  const ignorePatterns = ['node_modules', 'dist', '.git', 'build', '.next'];

  function scan(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (ignorePatterns.includes(entry.name)) continue;
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else {
          files++;
          try {
            size += fs.statSync(fullPath).size;
          } catch {}
        }
      }
    } catch {}
  }

  scan(dir);
  return { files, size };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}