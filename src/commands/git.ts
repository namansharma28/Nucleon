import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { isGitRepo } from '../core/git';
import { logger } from '../core/logger';

export async function gitCommand(action?: string) {
  if (!isGitRepo()) {
    logger.error('Not a git repository');
    return;
  }

  switch (action) {
    case 'sync':
      await syncCommand();
      break;
    case 'smart-commit':
      await smartCommitCommand();
      break;
    case 'branches':
      await branchesCommand();
      break;
    case 'status':
      await statusCommand();
      break;
    default:
      await interactiveGit();
  }
}

async function syncCommand() {
  console.log(chalk.bold('\n🔄 Git Sync\n'));

  try {
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      console.log(chalk.yellow('⚠ Uncommitted changes detected'));
      
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'stash',
          message: 'Stash changes before sync?',
          default: true,
        },
      ]);

      if (answers.stash) {
        execSync('git stash', { stdio: 'inherit' });
        logger.success('Changes stashed');
      }
    }

    // Get current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    console.log(chalk.cyan('Current branch:'), currentBranch);

    // Fetch latest changes
    console.log(chalk.blue('Fetching latest changes...'));
    execSync('git fetch origin', { stdio: 'inherit' });

    // Pull changes
    console.log(chalk.blue('Pulling changes...'));
    execSync(`git pull origin ${currentBranch}`, { stdio: 'inherit' });

    // Push local commits
    try {
      const unpushed = execSync(`git log origin/${currentBranch}..HEAD --oneline`, { encoding: 'utf-8' });
      if (unpushed.trim()) {
        console.log(chalk.blue('Pushing local commits...'));
        execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
      }
    } catch {
      console.log(chalk.yellow('No local commits to push'));
    }

    logger.success('Git sync completed!');
  } catch (error) {
    logger.error('Git sync failed: ' + (error as Error).message);
  }
}

async function smartCommitCommand() {
  console.log(chalk.bold('\n🧠 Smart Commit\n'));

  try {
    // Check for staged files
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    if (!staged.trim()) {
      console.log(chalk.yellow('No staged files. Staging all changes...'));
      execSync('git add .', { stdio: 'inherit' });
    }

    // Get file changes
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
    const diffStat = execSync('git diff --cached --numstat', { encoding: 'utf-8' });

    let totalAdded = 0;
    let totalRemoved = 0;
    diffStat.split('\n').filter(Boolean).forEach(line => {
      const [added, removed] = line.split('\t').map(Number);
      if (!isNaN(added)) totalAdded += added;
      if (!isNaN(removed)) totalRemoved += removed;
    });

    // Analyze changes to suggest commit type
    let commitType = 'chore';
    let scope = '';

    // Detect commit type based on files
    if (stagedFiles.some(f => f.includes('test') || f.includes('spec'))) {
      commitType = 'test';
    } else if (stagedFiles.some(f => f.includes('fix') || f.includes('bug'))) {
      commitType = 'fix';
    } else if (stagedFiles.some(f => f.includes('feat') || f.includes('feature'))) {
      commitType = 'feat';
    } else if (stagedFiles.some(f => f.includes('doc') || f.includes('readme'))) {
      commitType = 'docs';
    } else if (stagedFiles.some(f => f.includes('style') || f.includes('css'))) {
      commitType = 'style';
    } else if (totalAdded > totalRemoved * 2) {
      commitType = 'feat';
    } else if (totalRemoved > totalAdded) {
      commitType = 'refactor';
    }

    // Detect scope
    const folders = stagedFiles.map(f => f.split('/')[0]).filter(f => f !== '.');
    const commonFolder = folders.reduce((acc, folder) => {
      acc[folder] = (acc[folder] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonFolder = Object.entries(commonFolder).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonFolder && mostCommonFolder[1] > 1) {
      scope = mostCommonFolder[0];
    }

    // Generate commit message
    const scopeStr = scope ? `(${scope})` : '';
    const fileCount = stagedFiles.length;
    const changeDescription = totalAdded > totalRemoved ? 'add features' : 
                             totalRemoved > totalAdded ? 'refactor code' : 'update files';

    const suggestedMessage = `${commitType}${scopeStr}: ${changeDescription} in ${fileCount} file${fileCount > 1 ? 's' : ''}`;

    console.log(chalk.bold('📊 Change Summary:\n'));
    console.log(chalk.green(`+${totalAdded} lines added`));
    console.log(chalk.red(`-${totalRemoved} lines removed`));
    console.log(chalk.cyan(`${fileCount} files changed`));

    console.log(chalk.bold('\n📝 Suggested commit message:\n'));
    console.log(chalk.green(`  ${suggestedMessage}`));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Use suggested message',
          'Edit message',
          'Cancel',
        ],
      },
    ]);

    let finalMessage = suggestedMessage;

    if (answers.action === 'Edit message') {
      const editAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Enter commit message:',
          default: suggestedMessage,
        },
      ]);
      finalMessage = editAnswers.message;
    } else if (answers.action === 'Cancel') {
      console.log(chalk.yellow('Commit cancelled'));
      return;
    }

    execSync(`git commit -m "${finalMessage}"`, { stdio: 'inherit' });
    logger.success('Smart commit created!');

  } catch (error) {
    logger.error('Smart commit failed: ' + (error as Error).message);
  }
}

async function branchesCommand() {
  console.log(chalk.bold('\n🌿 Git Branches\n'));

  try {
    const branches = execSync('git branch -a', { encoding: 'utf-8' });
    console.log(branches);

    const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    console.log(chalk.cyan('\nCurrent branch:'), currentBranch);

    // Show recent commits on current branch
    const recentCommits = execSync('git log --oneline -5', { encoding: 'utf-8' });
    console.log(chalk.bold('\nRecent commits:\n'));
    console.log(recentCommits);
  } catch (error) {
    logger.error('Failed to get branch info: ' + (error as Error).message);
  }
}

async function statusCommand() {
  console.log(chalk.bold('\n📊 Git Status\n'));

  try {
    execSync('git status', { stdio: 'inherit' });
    
    // Additional info
    const unpushed = execSync('git log @{u}..HEAD --oneline', { encoding: 'utf-8' });
    if (unpushed.trim()) {
      console.log(chalk.yellow('\n📤 Unpushed commits:'));
      console.log(unpushed);
    }

    const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8' });
    if (untracked.trim()) {
      console.log(chalk.blue('\n📄 Untracked files:'));
      untracked.trim().split('\n').slice(0, 10).forEach(file => {
        console.log(`  ${file}`);
      });
    }
  } catch (error) {
    logger.error('Failed to get status: ' + (error as Error).message);
  }
}

async function interactiveGit() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Git workflow:',
      choices: [
        'Sync (fetch, pull, push)',
        'Smart commit',
        'View branches',
        'Status overview',
        'Exit',
      ],
    },
  ]);

  switch (answers.action) {
    case 'Sync (fetch, pull, push)':
      await syncCommand();
      break;
    case 'Smart commit':
      await smartCommitCommand();
      break;
    case 'View branches':
      await branchesCommand();
      break;
    case 'Status overview':
      await statusCommand();
      break;
  }
}