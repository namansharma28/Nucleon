import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export interface NucleonConfig {
  framework?: string;
  language?: string;
  database?: string;
  deployment?: {
    platform?: string;
    linked?: boolean;
    framework?: string;
  };
  lint?: boolean;
  test?: boolean;
  typescript?: boolean;
  docker?: boolean;
  ci?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  scripts?: Record<string, string>;
  hooks?: {
    preCommit?: string[];
    postCommit?: string[];
    preDeploy?: string[];
  };
  plugins?: string[];
  customCommands?: Record<string, string>;
}

const CONFIG_FILE = 'nucleon.config.json';

export function loadConfig(): NucleonConfig | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log(chalk.yellow('Warning: Invalid nucleon.config.json file'));
  }
  return null;
}

export function saveConfig(config: NucleonConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.log(chalk.red('Failed to save config file'));
  }
}

export function createDefaultConfig(): NucleonConfig {
  const config: NucleonConfig = {
    lint: true,
    test: false,
    typescript: false,
    packageManager: 'npm',
  };

  // Auto-detect project settings
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Detect framework
      if (deps['next']) config.framework = 'nextjs';
      else if (deps['react']) config.framework = 'react';
      else if (deps['express']) config.framework = 'express';
      else if (deps['vue']) config.framework = 'vue';
      else if (deps['nuxt']) config.framework = 'nuxt';

      // Detect language
      if (deps['typescript'] || fs.existsSync('tsconfig.json')) {
        config.language = 'typescript';
        config.typescript = true;
      } else {
        config.language = 'javascript';
      }

      // Detect database
      if (deps['mongodb'] || deps['mongoose']) config.database = 'mongodb';
      else if (deps['pg'] || deps['postgres']) config.database = 'postgresql';
      else if (deps['mysql']) config.database = 'mysql';
      else if (deps['sqlite3']) config.database = 'sqlite';

      // Detect package manager
      if (fs.existsSync('yarn.lock')) config.packageManager = 'yarn';
      else if (fs.existsSync('pnpm-lock.yaml')) config.packageManager = 'pnpm';

      // Detect testing
      if (deps['jest'] || deps['vitest'] || deps['mocha']) config.test = true;

      // Detect Docker
      if (fs.existsSync('Dockerfile')) config.docker = true;

      // Detect CI
      if (fs.existsSync('.github/workflows')) config.ci = 'github';
      else if (fs.existsSync('.gitlab-ci.yml')) config.ci = 'gitlab';
    } catch {}
  }

  // Python projects
  if (fs.existsSync('requirements.txt')) {
    config.language = 'python';
    
    try {
      const reqs = fs.readFileSync('requirements.txt', 'utf-8');
      if (reqs.includes('fastapi')) config.framework = 'fastapi';
      else if (reqs.includes('django')) config.framework = 'django';
      else if (reqs.includes('flask')) config.framework = 'flask';
    } catch {}
  }

  return config;
}

export function getConfigValue<K extends keyof NucleonConfig>(
  key: K,
  defaultValue?: NucleonConfig[K]
): NucleonConfig[K] {
  const config = loadConfig();
  return config?.[key] ?? defaultValue;
}

export function updateConfig(updates: Partial<NucleonConfig>): void {
  const config = loadConfig() || {};
  const newConfig = { ...config, ...updates };
  saveConfig(newConfig);
}

export function getPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  return getConfigValue('packageManager') || 'npm';
}

export function shouldRunLint(): boolean {
  return getConfigValue('lint') ?? true;
}

export function shouldRunTests(): boolean {
  return getConfigValue('test') ?? false;
}

export function getFramework(): string | undefined {
  return getConfigValue('framework');
}

export function getCustomCommands(): Record<string, string> {
  return getConfigValue('customCommands') || {};
}

export function hasDocker(): boolean {
  return getConfigValue('docker') ?? false;
}

export function getCIProvider(): string | undefined {
  return getConfigValue('ci');
}