import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { 
  isVercelInstalled, 
  showVercelInstallMessage,
  isProjectLinked,
  detectFramework,
  runPreDeploymentChecks,
  executeVercelCommand,
  saveVercelMetadata,
  openVercelDashboard,
  parseVercelStatus
} from '../core/vercel';
import { logger } from '../core/logger';

export async function vercelCommand(action?: string) {
  if (!isVercelInstalled()) {
    showVercelInstallMessage();
    return;
  }

  switch (action) {
    case 'link':
      await linkCommand();
      break;
    case 'deploy':
      await deployCommand();
      break;
    case 'status':
      await statusCommand();
      break;
    case 'open':
      openCommand();
      break;
    default:
      await interactiveVercel();
  }
}

async function linkCommand() {
  console.log(chalk.bold('\n🔗 Linking Vercel Project\n'));

  const spinner = ora('Linking project to Vercel...').start();

  try {
    await executeVercelCommand('link');
    const framework = detectFramework();
    
    saveVercelMetadata(true, framework);
    
    spinner.succeed('Vercel project linked');
    logger.success('Project connected to Vercel');
    
    if (framework) {
      logger.success(`Environment detected: ${framework}`);
    }

    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('  • Run'), chalk.bold('nucleon vercel deploy'), chalk.gray('to deploy'));
    console.log(chalk.gray('  • Run'), chalk.bold('nucleon vercel status'), chalk.gray('to check deployments'));
    console.log();

  } catch (error) {
    spinner.fail('Failed to link project');
    console.log(chalk.red((error as Error).message));
  }
}

async function deployCommand() {
  console.log(chalk.bold('\n🚀 Vercel Deployment\n'));

  // Run pre-deployment checks
  console.log(chalk.blue('Running pre-deployment checks...\n'));
  const checks = runPreDeploymentChecks();

  if (checks.issues.length > 0) {
    checks.issues.forEach(issue => {
      if (issue.includes('uncommitted changes')) {
        logger.warning(issue);
      } else {
        logger.error(issue);
      }
    });

    if (!checks.passed) {
      console.log(chalk.yellow('\nResolve issues above before deploying.'));
      
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAnyway',
          message: 'Deploy anyway?',
          default: false,
        },
      ]);

      if (!answers.continueAnyway) {
        console.log(chalk.yellow('Deployment cancelled'));
        return;
      }
    }
  } else {
    logger.success('Git repository clean');
    logger.success('Project analysis complete');
  }

  // Deploy
  console.log(chalk.bold('\n📦 Deploying to Vercel...\n'));
  const spinner = ora('Building and deploying...').start();

  try {
    const output = await executeVercelCommand('deploy');
    spinner.succeed('Deployment successful');

    // Extract URL from output
    const urlMatch = output.match(/(https:\/\/[^\s]+)/);
    if (urlMatch) {
      console.log(chalk.bold('\n🌐 Deployment URL:'));
      console.log(chalk.cyan(`  ${urlMatch[1]}\n`));
    }

    logger.success('Project deployed to Vercel');
    
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  • Run'), chalk.bold('nucleon vercel status'), chalk.gray('to check deployment'));
    console.log(chalk.gray('  • Run'), chalk.bold('nucleon vercel open'), chalk.gray('to view dashboard'));
    console.log();

  } catch (error) {
    spinner.fail('Deployment failed');
    console.log(chalk.red((error as Error).message));
    
    console.log(chalk.yellow('\nTroubleshooting:'));
    console.log(chalk.gray('  • Check'), chalk.bold('vercel logs'), chalk.gray('for detailed error info'));
    console.log(chalk.gray('  • Ensure all environment variables are set'));
    console.log(chalk.gray('  • Verify build script works locally'));
  }
}

async function statusCommand() {
  console.log(chalk.bold('\n📊 Deployment Status\n'));

  if (!isProjectLinked()) {
    logger.warning('Project not linked to Vercel');
    console.log(chalk.cyan('Run'), chalk.bold('nucleon vercel link'), chalk.cyan('first'));
    return;
  }

  const spinner = ora('Fetching deployment status...').start();

  try {
    const output = await executeVercelCommand('ls');
    const status = parseVercelStatus(output);
    
    spinner.succeed('Status retrieved');

    console.log(chalk.bold('Latest Deployment\n'));
    
    if (status.url) {
      console.log(chalk.cyan('URL:'), status.url);
    }
    
    if (status.status) {
      const statusColor = status.status === 'Ready' ? chalk.green : 
                         status.status === 'Building' ? chalk.yellow : chalk.red;
      console.log(chalk.cyan('Status:'), statusColor(status.status));
    }

    console.log(chalk.cyan('Environment:'), 'Production');
    
    // Show recent deployments
    console.log(chalk.bold('\n📋 Recent Deployments\n'));
    console.log(output);

  } catch (error) {
    spinner.fail('Failed to get status');
    console.log(chalk.red((error as Error).message));
  }
}

function openCommand() {
  console.log(chalk.bold('\n🌐 Opening Vercel Dashboard\n'));
  
  logger.success('Opening Vercel dashboard in browser...');
  openVercelDashboard();
}

async function interactiveVercel() {
  if (!isProjectLinked()) {
    console.log(chalk.yellow('Project not linked to Vercel yet.\n'));
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Vercel workflow:',
      choices: [
        { name: '🔗 Link project to Vercel', value: 'link' },
        { name: '🚀 Deploy to Vercel', value: 'deploy' },
        { name: '📊 Check deployment status', value: 'status' },
        { name: '🌐 Open Vercel dashboard', value: 'open' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  switch (answers.action) {
    case 'link':
      await linkCommand();
      break;
    case 'deploy':
      await deployCommand();
      break;
    case 'status':
      await statusCommand();
      break;
    case 'open':
      openCommand();
      break;
  }
}