import chalk from 'chalk';
import { checkCommand } from '../core/system';
import { logger } from '../core/logger';
import { isVercelInstalled } from '../core/vercel';
import * as fs from 'fs';

export function doctorCommand() {
  console.log(chalk.bold('\n⚡ Nucleon Doctor Report\n'));

  const checks = [
    { name: 'Node.js', command: 'node', required: true },
    { name: 'npm', command: 'npm', required: true },
    { name: 'Git', command: 'git', required: true },
    { name: 'Vercel CLI', command: 'vercel', required: false, customCheck: isVercelInstalled },
    { name: 'TypeScript', command: 'tsc', required: false },
    { name: 'Python', command: 'python', required: false },
    { name: 'Docker', command: 'docker', required: false },
  ];

  let issues = 0;

  checks.forEach(({ name, command, required, customCheck }) => {
    const isInstalled = customCheck ? customCheck() : checkCommand(command);
    
    if (isInstalled) {
      logger.success(`${name} installed`);
    } else {
      if (required) {
        logger.error(`${name} not found (required)`);
        issues++;
      } else {
        logger.warning(`${name} not found (optional)`);
        
        // Show installation hint for Vercel
        if (name === 'Vercel CLI') {
          console.log(chalk.gray('    Install with:'), chalk.cyan('nucleon setup'), chalk.gray('or'), chalk.cyan('npm install -g vercel'));
        }
      }
    }
  });

  // Check project-specific requirements
  console.log(chalk.bold('\n📋 Project Requirements\n'));

  if (fs.existsSync('package.json')) {
    logger.success('package.json found');
    
    // Check if node_modules exists
    if (fs.existsSync('node_modules')) {
      logger.success('Dependencies installed');
    } else {
      logger.warning('Dependencies not installed - run npm install');
      issues++;
    }

    // Check for common config files
    const configFiles = ['.gitignore', 'tsconfig.json', '.env.example'];
    configFiles.forEach(file => {
      if (fs.existsSync(file)) {
        logger.success(`${file} found`);
      } else {
        logger.info(`${file} missing (optional)`);
      }
    });
  } else {
    logger.info('No package.json found');
  }

  // Check Git repository
  if (fs.existsSync('.git')) {
    logger.success('Git repository initialized');
    
    // Check for uncommitted changes
    try {
      const { execSync } = require('child_process');
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      if (status.trim()) {
        logger.warning('Uncommitted changes detected');
      } else {
        logger.success('Working directory clean');
      }
    } catch {
      logger.info('Could not check git status');
    }
  } else {
    logger.info('Not a git repository');
  }

  // Summary
  console.log(chalk.bold('\n📊 Summary\n'));
  if (issues === 0) {
    logger.success('Environment looks good!');
  } else {
    logger.warning(`${issues} issue(s) found that may affect development`);
    console.log(chalk.cyan('\nRun'), chalk.bold('nucleon setup'), chalk.cyan('to automatically install missing tools'));
  }

  console.log();
}
