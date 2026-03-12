import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import chalk from 'chalk';
import { updateConfig, loadConfig } from './config';

export function isVercelInstalled(): boolean {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function showVercelInstallMessage(): void {
  console.log(chalk.red('Vercel CLI not detected.'));
  console.log(chalk.cyan('Install with:'), chalk.bold('npm install -g vercel'));
  console.log(chalk.gray('Or visit: https://vercel.com/cli'));
}

export function isProjectLinked(): boolean {
  const config = loadConfig();
  return config?.deployment?.platform === 'vercel' && config?.deployment?.linked === true;
}

export function detectFramework(): string | undefined {
  if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
    return 'Next.js';
  }
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['next']) return 'Next.js';
      if (deps['react']) return 'React';
      if (deps['vue']) return 'Vue';
      if (deps['nuxt']) return 'Nuxt';
      if (deps['svelte']) return 'Svelte';
    } catch {}
  }
  return undefined;
}

export function runPreDeploymentChecks(): { passed: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if git repo is clean
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      issues.push('Git repository has uncommitted changes');
    }
  } catch {
    issues.push('Not a git repository');
  }

  // Check for environment variables
  if (!fs.existsSync('.env') && !fs.existsSync('.env.local')) {
    // This is just a warning, not a blocker
  }

  // Check if project is linked
  if (!isProjectLinked()) {
    issues.push('Project not linked to Vercel (run: nucleon vercel link)');
  }

  // Check for build script in package.json
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      if (!pkg.scripts?.build) {
        issues.push('No build script found in package.json');
      }
    } catch {}
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

export function executeVercelCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`vercel ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

export function saveVercelMetadata(linked: boolean, framework?: string): void {
  const config = loadConfig() || {};
  
  updateConfig({
    ...config,
    deployment: {
      platform: 'vercel',
      linked,
      framework,
    },
  });
}

export function openVercelDashboard(): void {
  const command = process.platform === 'win32' ? 'start' : 
                  process.platform === 'darwin' ? 'open' : 'xdg-open';
  
  try {
    execSync(`${command} https://vercel.com/dashboard`, { stdio: 'ignore' });
  } catch (error) {
    console.log(chalk.yellow('Could not open browser automatically'));
    console.log(chalk.cyan('Visit:'), 'https://vercel.com/dashboard');
  }
}

export function parseVercelStatus(output: string): {
  project?: string;
  environment?: string;
  status?: string;
  url?: string;
  deployedAt?: string;
} {
  const lines = output.split('\n');
  const result: any = {};

  // Parse vercel ls output
  lines.forEach(line => {
    if (line.includes('https://')) {
      const urlMatch = line.match(/(https:\/\/[^\s]+)/);
      if (urlMatch) result.url = urlMatch[1];
    }
    
    if (line.includes('Ready') || line.includes('Building') || line.includes('Error')) {
      if (line.includes('Ready')) result.status = 'Ready';
      else if (line.includes('Building')) result.status = 'Building';
      else if (line.includes('Error')) result.status = 'Error';
    }
  });

  return result;
}