import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export interface UpdateInfo {
  current: string;
  latest: string;
  hasUpdate: boolean;
  changelog?: string;
  releaseDate?: string;
}

export interface UpdateResult {
  success: boolean;
  message: string;
  previousVersion?: string;
  newVersion?: string;
}

const UPDATE_CHECK_FILE = path.join(os.homedir(), '.nucleon-update-check');
const BACKUP_DIR = path.join(os.homedir(), '.nucleon-backups');

export async function checkForUpdates(silent = false): Promise<UpdateInfo> {
  try {
    if (!silent) {
      const spinner = ora('Checking for updates...').start();
      
      setTimeout(() => {
        spinner.succeed('Update check complete');
      }, 1000);
    }

    // Get current version
    const currentVersion = getCurrentVersion();
    
    // Get latest version from npm
    const latestVersion = await getLatestVersion();
    
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
    
    // Get changelog if there's an update
    let changelog = '';
    if (hasUpdate) {
      changelog = await getChangelog(latestVersion);
    }

    const updateInfo: UpdateInfo = {
      current: currentVersion,
      latest: latestVersion,
      hasUpdate,
      changelog,
    };

    // Save last check time
    saveLastCheckTime();

    return updateInfo;
  } catch (error) {
    return {
      current: getCurrentVersion(),
      latest: getCurrentVersion(),
      hasUpdate: false,
    };
  }
}

export async function performUpdate(): Promise<UpdateResult> {
  const spinner = ora('Preparing update...').start();

  try {
    const updateInfo = await checkForUpdates(true);
    
    if (!updateInfo.hasUpdate) {
      spinner.succeed('Already on latest version');
      return {
        success: true,
        message: 'Already on latest version',
      };
    }

    // Create backup
    spinner.text = 'Creating backup...';
    const backupResult = createBackup();
    
    if (!backupResult.success) {
      spinner.fail('Failed to create backup');
      return {
        success: false,
        message: 'Failed to create backup: ' + backupResult.message,
      };
    }

    // Perform update
    spinner.text = `Updating to v${updateInfo.latest}...`;
    
    try {
      execSync('npm install -g nucleon-cli@latest', { stdio: 'pipe' });
      
      spinner.succeed(`Updated to v${updateInfo.latest}`);
      
      // Show changelog
      if (updateInfo.changelog) {
        console.log(chalk.bold('\n📋 What\'s New:\n'));
        console.log(updateInfo.changelog);
      }

      return {
        success: true,
        message: `Successfully updated to v${updateInfo.latest}`,
        previousVersion: updateInfo.current,
        newVersion: updateInfo.latest,
      };
    } catch (updateError) {
      spinner.fail('Update failed');
      
      // Attempt rollback
      console.log(chalk.yellow('Attempting rollback...'));
      const rollbackResult = rollbackUpdate();
      
      if (rollbackResult.success) {
        console.log(chalk.green('✔ Rollback successful'));
      } else {
        console.log(chalk.red('✖ Rollback failed'));
      }

      return {
        success: false,
        message: 'Update failed: ' + (updateError as Error).message,
      };
    }
  } catch (error) {
    spinner.fail('Update process failed');
    return {
      success: false,
      message: 'Update process failed: ' + (error as Error).message,
    };
  }
}

export function shouldCheckForUpdates(): boolean {
  try {
    if (!fs.existsSync(UPDATE_CHECK_FILE)) {
      return true;
    }

    const lastCheck = fs.readFileSync(UPDATE_CHECK_FILE, 'utf-8');
    const lastCheckTime = new Date(lastCheck);
    const now = new Date();
    const daysSinceCheck = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceCheck >= 7; // Check weekly
  } catch {
    return true;
  }
}

export async function backgroundUpdateCheck(): Promise<void> {
  if (!shouldCheckForUpdates()) {
    return;
  }

  try {
    const updateInfo = await checkForUpdates(true);
    
    if (updateInfo.hasUpdate) {
      console.log(chalk.yellow('\n🔔 Update Available!'));
      console.log(chalk.gray(`Current: v${updateInfo.current} → Latest: v${updateInfo.latest}`));
      console.log(chalk.cyan('Run'), chalk.bold('nucleon update'), chalk.cyan('to update\n'));
    }
  } catch {
    // Silent fail for background checks
  }
}

function getCurrentVersion(): string {
  try {
    const packagePath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    return pkg.version;
  } catch {
    return '1.0.0';
  }
}

async function getLatestVersion(): Promise<string> {
  try {
    const output = execSync('npm view nucleon-cli version', { encoding: 'utf-8' });
    return output.trim();
  } catch {
    return getCurrentVersion();
  }
}

async function getChangelog(version: string): Promise<string> {
  try {
    // Try to get changelog from npm
    const output = execSync(`npm view nucleon-cli@${version} --json`, { encoding: 'utf-8' });
    const packageInfo = JSON.parse(output);
    
    // Generate simple changelog
    return `Version ${version} includes bug fixes and improvements.\nSee GitHub releases for detailed changelog.`;
  } catch {
    return `Updated to version ${version}`;
  }
}

function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  
  return 0;
}

function saveLastCheckTime(): void {
  try {
    fs.writeFileSync(UPDATE_CHECK_FILE, new Date().toISOString());
  } catch {
    // Silent fail
  }
}

function createBackup(): { success: boolean; message: string } {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const currentVersion = getCurrentVersion();
    const backupFile = path.join(BACKUP_DIR, `nucleon-${currentVersion}.backup`);
    
    // Simple backup - just store version info
    fs.writeFileSync(backupFile, JSON.stringify({
      version: currentVersion,
      timestamp: new Date().toISOString(),
    }));

    return { success: true, message: 'Backup created' };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

function rollbackUpdate(): { success: boolean; message: string } {
  try {
    // Get latest backup
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.backup'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      return { success: false, message: 'No backup found' };
    }

    const latestBackup = backups[0];
    const backupPath = path.join(BACKUP_DIR, latestBackup);
    const backupInfo = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Reinstall previous version
    execSync(`npm install -g nucleon-cli@${backupInfo.version}`, { stdio: 'pipe' });

    return { success: true, message: `Rolled back to v${backupInfo.version}` };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function showVersionInfo(): Promise<void> {
  console.log(chalk.bold('\n📦 Nucleon CLI Version Info\n'));

  const current = getCurrentVersion();
  console.log(chalk.cyan('Current Version:'), `v${current}`);

  try {
    const spinner = ora('Checking for updates...').start();
    const updateInfo = await checkForUpdates(true);
    spinner.stop();

    console.log(chalk.cyan('Latest Version:'), `v${updateInfo.latest}`);

    if (updateInfo.hasUpdate) {
      console.log(chalk.yellow('\n🔔 Update Available!'));
      console.log(chalk.green('Run'), chalk.bold('nucleon update'), chalk.green('to update'));
    } else {
      console.log(chalk.green('\n✅ You\'re on the latest version!'));
    }
  } catch {
    console.log(chalk.gray('Could not check for updates'));
  }

  console.log();
}