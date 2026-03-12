import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  loadConfig, 
  saveConfig, 
  createDefaultConfig, 
  updateConfig,
  NucleonConfig 
} from '../core/config';
import { logger } from '../core/logger';

export async function configCommand(action?: string, key?: string, value?: string) {
  switch (action) {
    case 'show':
      showConfig();
      break;
    case 'init':
      await initConfig();
      break;
    case 'set':
      if (key && value) {
        setConfigValue(key, value);
      } else {
        console.log(chalk.red('Usage: nucleon config set <key> <value>'));
      }
      break;
    case 'get':
      if (key) {
        getConfigValue(key);
      } else {
        console.log(chalk.red('Usage: nucleon config get <key>'));
      }
      break;
    case 'edit':
      await editConfig();
      break;
    default:
      showConfig();
  }
}

function showConfig() {
  const config = loadConfig();

  if (!config) {
    console.log(chalk.yellow('No nucleon.config.json found. Run'), chalk.bold('nucleon config init'), chalk.yellow('to create one.'));
    return;
  }

  console.log(chalk.bold('\n⚙️  Project Configuration\n'));
  
  // Core settings
  if (config.framework) console.log(chalk.cyan('Framework:'), config.framework);
  if (config.language) console.log(chalk.cyan('Language:'), config.language);
  if (config.database) console.log(chalk.cyan('Database:'), config.database);
  if (config.deployment) console.log(chalk.cyan('Deployment:'), config.deployment);
  if (config.packageManager) console.log(chalk.cyan('Package Manager:'), config.packageManager);
  
  // Features
  console.log(chalk.bold('\n🔧 Features'));
  console.log(chalk.cyan('Linting:'), config.lint ? chalk.green('enabled') : chalk.red('disabled'));
  console.log(chalk.cyan('Testing:'), config.test ? chalk.green('enabled') : chalk.red('disabled'));
  console.log(chalk.cyan('TypeScript:'), config.typescript ? chalk.green('enabled') : chalk.red('disabled'));
  console.log(chalk.cyan('Docker:'), config.docker ? chalk.green('enabled') : chalk.red('disabled'));
  
  if (config.ci) console.log(chalk.cyan('CI/CD:'), config.ci);

  // Custom scripts
  if (config.scripts && Object.keys(config.scripts).length > 0) {
    console.log(chalk.bold('\n📜 Custom Scripts'));
    Object.entries(config.scripts).forEach(([name, command]) => {
      console.log(chalk.cyan(`  ${name}:`), command);
    });
  }

  // Plugins
  if (config.plugins && config.plugins.length > 0) {
    console.log(chalk.bold('\n🔌 Plugins'));
    config.plugins.forEach(plugin => {
      console.log(chalk.green('  •'), plugin);
    });
  }

  console.log();
}

async function initConfig() {
  console.log(chalk.bold('\n🔍 Auto-detecting project configuration...\n'));
  
  const defaultConfig = createDefaultConfig();
  
  // Show detected settings
  console.log(chalk.green('✔ Auto-detected settings:'));
  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (value !== undefined && value !== false) {
      console.log(chalk.blue(`  ${key}:`), value);
    }
  });

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useDefaults',
      message: 'Use auto-detected configuration?',
      default: true,
    },
  ]);

  if (answers.useDefaults) {
    saveConfig(defaultConfig);
    logger.success('Configuration saved to nucleon.config.json');
  } else {
    await editConfig(defaultConfig);
  }
}

async function editConfig(baseConfig?: NucleonConfig) {
  const config = baseConfig || loadConfig() || {};

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Framework:',
      choices: ['nextjs', 'react', 'vue', 'express', 'fastapi', 'django', 'flask', 'none'],
      default: config.framework || 'none',
    },
    {
      type: 'list',
      name: 'language',
      message: 'Primary language:',
      choices: ['typescript', 'javascript', 'python', 'go', 'rust'],
      default: config.language || 'javascript',
    },
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      choices: ['mongodb', 'postgresql', 'mysql', 'sqlite', 'none'],
      default: config.database || 'none',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: config.packageManager || 'npm',
    },
    {
      type: 'confirm',
      name: 'lint',
      message: 'Enable linting?',
      default: config.lint ?? true,
    },
    {
      type: 'confirm',
      name: 'test',
      message: 'Enable testing?',
      default: config.test ?? false,
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: config.typescript ?? false,
    },
    {
      type: 'confirm',
      name: 'docker',
      message: 'Use Docker?',
      default: config.docker ?? false,
    },
  ]);

  // Clean up "none" values
  Object.keys(answers).forEach(key => {
    if (answers[key] === 'none') {
      answers[key] = undefined;
    }
  });

  const newConfig: NucleonConfig = {
    ...config,
    ...answers,
  };

  saveConfig(newConfig);
  logger.success('Configuration updated!');
}

function setConfigValue(key: string, value: string) {
  const config = loadConfig() || {};
  
  // Parse boolean values
  let parsedValue: any = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  
  (config as any)[key] = parsedValue;
  saveConfig(config);
  
  logger.success(`Set ${key} = ${parsedValue}`);
}

function getConfigValue(key: string) {
  const config = loadConfig();
  
  if (!config) {
    console.log(chalk.yellow('No configuration found'));
    return;
  }
  
  const value = (config as any)[key];
  if (value !== undefined) {
    console.log(chalk.cyan(`${key}:`), value);
  } else {
    console.log(chalk.yellow(`${key} not set`));
  }
}