import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  checkForUpdates, 
  performUpdate, 
  showVersionInfo,
  backgroundUpdateCheck 
} from '../core/updater';
import { handleError, ErrorTypes } from '../core/errors';

export async function updateCommand(action?: string) {
  switch (action) {
    case 'check':
      await checkCommand();
      break;
    case 'info':
    case 'version':
      await showVersionInfo();
      break;
    default:
      await interactiveUpdate();
  }
}

async function checkCommand() {
  try {
    const updateInfo = await checkForUpdates();

    console.log(chalk.bold('\n🔍 Update Check\n'));
    console.log(chalk.cyan('Current Version:'), `v${updateInfo.current}`);
    console.log(chalk.cyan('Latest Version:'), `v${updateInfo.latest}`);

    if (updateInfo.hasUpdate) {
      console.log(chalk.yellow('\n🔔 Update Available!'));
      
      if (updateInfo.changelog) {
        console.log(chalk.bold('\n📋 What\'s New:\n'));
        console.log(updateInfo.changelog);
      }

      console.log(chalk.green('\nRun'), chalk.bold('nucleon update'), chalk.green('to update'));
    } else {
      console.log(chalk.green('\n✅ You\'re on the latest version!'));
    }

    console.log();
  } catch (error) {
    handleError(ErrorTypes.NETWORK_ERROR('update check'));
  }
}

async function interactiveUpdate() {
  try {
    console.log(chalk.bold('\n🔄 Nucleon Update Manager\n'));

    const updateInfo = await checkForUpdates();

    if (!updateInfo.hasUpdate) {
      console.log(chalk.green('✅ You\'re already on the latest version!'));
      console.log(chalk.gray(`Current version: v${updateInfo.current}`));
      return;
    }

    console.log(chalk.yellow('🔔 Update Available!'));
    console.log(chalk.gray(`Current: v${updateInfo.current} → Latest: v${updateInfo.latest}`));

    if (updateInfo.changelog) {
      console.log(chalk.bold('\n📋 What\'s New:\n'));
      console.log(updateInfo.changelog);
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Update now', value: 'update' },
          { name: '📋 Show version info', value: 'info' },
          { name: '❌ Cancel', value: 'cancel' },
        ],
      },
    ]);

    switch (answers.action) {
      case 'update':
        await performUpdateWithConfirmation(updateInfo);
        break;
      case 'info':
        await showVersionInfo();
        break;
      case 'cancel':
        console.log(chalk.gray('Update cancelled'));
        break;
    }
  } catch (error) {
    handleError(error as Error);
  }
}

async function performUpdateWithConfirmation(updateInfo: any) {
  const confirmAnswers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Update to v${updateInfo.latest}?`,
      default: true,
    },
  ]);

  if (!confirmAnswers.confirm) {
    console.log(chalk.gray('Update cancelled'));
    return;
  }

  console.log(chalk.bold('\n🔄 Starting Update Process\n'));

  try {
    const result = await performUpdate();

    if (result.success) {
      console.log(chalk.green('\n🎉 Update Successful!\n'));
      console.log(chalk.gray('Previous version:'), `v${result.previousVersion}`);
      console.log(chalk.gray('New version:'), `v${result.newVersion}`);
      
      console.log(chalk.cyan('\nRestart your terminal to ensure all changes take effect.'));
    } else {
      console.log(chalk.red('\n❌ Update Failed\n'));
      console.log(chalk.red(result.message));
      
      console.log(chalk.yellow('\n💡 Try manual update:'));
      console.log(chalk.cyan('  npm install -g nucleon-cli@latest'));
    }
  } catch (error) {
    handleError(ErrorTypes.UPDATE_FAILED((error as Error).message));
  }
}

// Background update check (called from main CLI)
export async function runBackgroundUpdateCheck(): Promise<void> {
  try {
    await backgroundUpdateCheck();
  } catch {
    // Silent fail for background checks
  }
}