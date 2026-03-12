import chalk from 'chalk';
import { execSync } from 'child_process';
import * as fs from 'fs';

export function summaryCommand() {
  console.log(chalk.bold('\n📈 Daily Development Summary\n'));

  if (!fs.existsSync('.git')) {
    console.log(chalk.yellow('Not a git repository'));
    return;
  }

  try {
    // Get today's commits
    const today = new Date().toISOString().split('T')[0];
    const commits = execSync(`git log --since="${today}" --oneline`, { encoding: 'utf-8' });
    const commitCount = commits.trim() ? commits.trim().split('\n').length : 0;

    // Get today's file changes
    const changedFiles = execSync(`git log --since="${today}" --name-only --pretty=format:`, { encoding: 'utf-8' });
    const uniqueFiles = new Set(changedFiles.split('\n').filter(Boolean));

    // Get lines added/removed today
    let linesAdded = 0;
    let linesRemoved = 0;
    
    try {
      const diffStat = execSync(`git log --since="${today}" --numstat --pretty=format:`, { encoding: 'utf-8' });
      const lines = diffStat.split('\n').filter(Boolean);
      
      lines.forEach(line => {
        const [added, removed] = line.split('\t').map(Number);
        if (!isNaN(added)) linesAdded += added;
        if (!isNaN(removed)) linesRemoved += removed;
      });
    } catch {}

    console.log(chalk.cyan('Date:'), new Date().toLocaleDateString());
    console.log(chalk.cyan('Commits:'), commitCount);
    console.log(chalk.cyan('Files Modified:'), uniqueFiles.size);
    console.log(chalk.cyan('Lines Added:'), chalk.green(`+${linesAdded}`));
    console.log(chalk.cyan('Lines Removed:'), chalk.red(`-${linesRemoved}`));
    console.log(chalk.cyan('Net Change:'), linesAdded - linesRemoved);

    // Show recent commits
    if (commitCount > 0) {
      console.log(chalk.bold('\n📝 Recent Commits\n'));
      const recentCommits = commits.trim().split('\n').slice(0, 5);
      recentCommits.forEach((commit, index) => {
        console.log(`  ${index + 1}. ${commit}`);
      });
    }

    // Weekly summary
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyCommits = execSync(`git log --since="${weekAgo.toISOString()}" --oneline`, { encoding: 'utf-8' });
      const weeklyCount = weeklyCommits.trim() ? weeklyCommits.trim().split('\n').length : 0;
      
      console.log(chalk.bold('\n📊 This Week\n'));
      console.log(chalk.cyan('Total Commits:'), weeklyCount);
      console.log(chalk.cyan('Daily Average:'), Math.round(weeklyCount / 7 * 10) / 10);
    } catch {}

    console.log();
  } catch (error) {
    console.error('Failed to generate summary:', (error as Error).message);
  }
}