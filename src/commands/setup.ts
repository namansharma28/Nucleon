import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';
import { logger } from '../core/logger';
import { isVercelInstalled } from '../core/vercel';
import { checkCommand } from '../core/system';

interface SetupOptions {
  skipVercel?: boolean;
  skipOptional?: boolean;
}

export async function setupCommand(options: SetupOptions = {}) {
  console.log(chalk.bold('\n🚀 Nucleon Setup & Installation\n'));
  console.log(chalk.gray('Setting up your development environment...\n'));

  const results = {
    vercel: false,
    optional: [] as string[],
  };

  // Check and install Vercel CLI
  if (!options.skipVercel) {
    await setupVercel(results);
  }

  // Check and install optional tools
  if (!options.skipOptional) {
    await setupOptionalTools(results);
  }

  // Show summary
  showSetupSummary(results);
}

async function setupVercel(results: { vercel: boolean }) {
  console.log(chalk.bold('📦 Vercel CLI Setup\n'));

  if (isVercelInstalled()) {
    logger.success('Vercel CLI already installed');
    results.vercel = true;
    return;
  }

  console.log(chalk.yellow('Vercel CLI not found'));
  console.log(chalk.gray('Vercel CLI is required for deployment features\n'));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installVercel',
      message: 'Install Vercel CLI automatically?',
      default: true,
    },
  ]);

  if (answers.installVercel) {
    const spinner = ora('Installing Vercel CLI...').start();
    
    try {
      execSync('npm install -g vercel', { stdio: 'pipe' });
      spinner.succeed('Vercel CLI installed successfully');
      results.vercel = true;
      
      console.log(chalk.green('\n✨ Vercel CLI is now available!'));
      console.log(chalk.gray('You can now use:'), chalk.bold('nucleon vercel'));
      
    } catch (error) {
      spinner.fail('Failed to install Vercel CLI');
      console.log(chalk.red('Error:'), (error as Error).message);
      console.log(chalk.yellow('\nManual installation:'));
      console.log(chalk.cyan('  npm install -g vercel'));
      console.log(chalk.gray('  or visit: https://vercel.com/cli'));
    }
  } else {
    console.log(chalk.yellow('Skipping Vercel CLI installation'));
    console.log(chalk.gray('You can install it later with:'), chalk.bold('npm install -g vercel'));
  }

  console.log();
}

async function setupOptionalTools(results: { optional: string[] }) {
  console.log(chalk.bold('🔧 Optional Development Tools\n'));

  const tools = [
    { name: 'TypeScript', command: 'tsc', install: 'npm install -g typescript' },
    { name: 'ESLint', command: 'eslint', install: 'npm install -g eslint' },
    { name: 'Prettier', command: 'prettier', install: 'npm install -g prettier' },
    { name: 'Docker', command: 'docker', install: 'Install from https://docker.com' },
  ];

  const missingTools = tools.filter(tool => !checkCommand(tool.command));

  if (missingTools.length === 0) {
    logger.success('All optional tools are already installed');
    return;
  }

  console.log(chalk.yellow(`Found ${missingTools.length} optional tools that could be installed:\n`));
  
  missingTools.forEach(tool => {
    console.log(chalk.gray('  •'), tool.name, chalk.gray('- not installed'));
  });

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'toolsToInstall',
      message: 'Select tools to install:',
      choices: missingTools
        .filter(tool => tool.name !== 'Docker') // Skip Docker as it needs manual install
        .map(tool => ({
          name: `${tool.name} (${tool.install})`,
          value: tool,
        })),
    },
  ]);

  for (const tool of answers.toolsToInstall) {
    const spinner = ora(`Installing ${tool.name}...`).start();
    
    try {
      execSync(tool.install, { stdio: 'pipe' });
      spinner.succeed(`${tool.name} installed successfully`);
      results.optional.push(tool.name);
    } catch (error) {
      spinner.fail(`Failed to install ${tool.name}`);
      console.log(chalk.red('Error:'), (error as Error).message);
      console.log(chalk.yellow('Manual installation:'), tool.install);
    }
  }

  console.log();
}

function showSetupSummary(results: { vercel: boolean; optional: string[] }) {
  console.log(chalk.bold('📋 Setup Summary\n'));

  // Core tools
  console.log(chalk.bold('Core Tools:'));
  console.log(chalk.green('  ✔ Node.js'), chalk.gray('(required)'));
  console.log(chalk.green('  ✔ npm'), chalk.gray('(required)'));
  console.log(chalk.green('  ✔ Git'), chalk.gray('(required)'));

  // Deployment tools
  console.log(chalk.bold('\nDeployment Tools:'));
  if (results.vercel) {
    console.log(chalk.green('  ✔ Vercel CLI'), chalk.gray('(for nucleon vercel commands)'));
  } else {
    console.log(chalk.yellow('  ⚠ Vercel CLI'), chalk.gray('(install later with: npm install -g vercel)'));
  }

  // Optional tools
  if (results.optional.length > 0) {
    console.log(chalk.bold('\nOptional Tools:'));
    results.optional.forEach(tool => {
      console.log(chalk.green(`  ✔ ${tool}`), chalk.gray('(installed)'));
    });
  }

  console.log(chalk.bold('\n🎉 Setup Complete!\n'));
  
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.gray('  • Run'), chalk.bold('nucleon doctor'), chalk.gray('to verify your environment'));
  console.log(chalk.gray('  • Run'), chalk.bold('nucleon init'), chalk.gray('to create a new project'));
  if (results.vercel) {
    console.log(chalk.gray('  • Run'), chalk.bold('nucleon vercel link'), chalk.gray('to connect a project to Vercel'));
  }
  console.log(chalk.gray('  • Run'), chalk.bold('nucleon --help'), chalk.gray('to see all available commands'));
  
  console.log();
}

export async function postInstallSetup() {
  console.log(chalk.bold('\n🎉 Welcome to Nucleon!\n'));
  console.log(chalk.gray('Let\'s set up your development environment...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runSetup',
      message: 'Run automatic setup now?',
      default: true,
    },
  ]);

  if (answers.runSetup) {
    await setupCommand();
  } else {
    console.log(chalk.yellow('Setup skipped'));
    console.log(chalk.gray('You can run setup later with:'), chalk.bold('nucleon setup'));
    console.log();
  }
}