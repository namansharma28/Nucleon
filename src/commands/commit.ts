import inquirer from 'inquirer';
import chalk from 'chalk';
import { isGitRepo, getStagedFiles, createCommit } from '../core/git';
import { logger } from '../core/logger';

export async function commitCommand() {
  if (!isGitRepo()) {
    logger.error('Not a git repository');
    return;
  }

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    logger.warning('No staged files. Use "git add" first.');
    return;
  }

  console.log(chalk.bold('\nDetected changes:\n'));
  stagedFiles.forEach((file) => console.log(`  ${file}`));

  // Simple commit type inference
  let commitType = 'chore';
  if (stagedFiles.some((f) => f.includes('test'))) commitType = 'test';
  if (stagedFiles.some((f) => f.includes('fix'))) commitType = 'fix';
  if (stagedFiles.some((f) => f.includes('feat'))) commitType = 'feat';

  const suggestedMessage = `${commitType}: update ${stagedFiles.length} file(s)`;

  console.log(chalk.bold('\nSuggested commit message:'));
  console.log(chalk.green(`  ${suggestedMessage}\n`));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useMessage',
      message: 'Use this commit message?',
      default: true,
    },
    {
      type: 'input',
      name: 'customMessage',
      message: 'Enter custom message:',
      when: (ans) => !ans.useMessage,
    },
  ]);

  const finalMessage = answers.useMessage ? suggestedMessage : answers.customMessage;

  try {
    createCommit(finalMessage);
    logger.success('Commit created!');
  } catch (error) {
    logger.error('Failed to create commit');
  }
}
