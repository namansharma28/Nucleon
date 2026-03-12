import chalk from 'chalk';
import * as fs from 'fs';
import ora from 'ora';
import { execSync } from 'child_process';

export async function depsCommand() {
  if (!fs.existsSync('package.json')) {
    console.log(chalk.red('No package.json found'));
    return;
  }

  const spinner = ora('Checking dependencies...').start();

  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (Object.keys(deps).length === 0) {
      spinner.succeed('No dependencies found');
      return;
    }

    // Check for outdated packages
    let outdatedOutput = '';
    try {
      outdatedOutput = execSync('npm outdated --json', { encoding: 'utf-8' });
    } catch (error: any) {
      // npm outdated exits with code 1 when outdated packages exist
      outdatedOutput = error.stdout || '';
    }

    spinner.succeed('Dependency check complete');

    console.log(chalk.bold('\n📦 Dependency Report\n'));
    console.log(chalk.cyan('Total Dependencies:'), Object.keys(deps).length);

    if (outdatedOutput) {
      try {
        const outdated = JSON.parse(outdatedOutput);
        const outdatedCount = Object.keys(outdated).length;

        if (outdatedCount > 0) {
          console.log(chalk.yellow('Outdated Packages:'), outdatedCount);
          console.log(chalk.bold('\n📅 Outdated Dependencies\n'));

          Object.entries(outdated).slice(0, 10).forEach(([name, info]: [string, any]) => {
            console.log(`  ${name.padEnd(25)} ${info.current} → ${chalk.green(info.latest)}`);
          });

          if (outdatedCount > 10) {
            console.log(chalk.gray(`  ... and ${outdatedCount - 10} more`));
          }

          console.log(chalk.bold('\n💡 Update Commands\n'));
          console.log(chalk.green('  npm update'), '- Update all packages');
          console.log(chalk.green('  npm audit fix'), '- Fix security vulnerabilities');
        } else {
          console.log(chalk.green('✔ All dependencies are up to date'));
        }
      } catch {
        console.log(chalk.yellow('Could not parse outdated package information'));
      }
    }

    // Security audit
    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
      const audit = JSON.parse(auditOutput);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        console.log(chalk.bold('\n🔒 Security Audit\n'));
        console.log(chalk.red('Vulnerabilities found:'), audit.metadata.vulnerabilities.total);
        console.log(chalk.yellow('  High:'), audit.metadata.vulnerabilities.high || 0);
        console.log(chalk.yellow('  Moderate:'), audit.metadata.vulnerabilities.moderate || 0);
        console.log(chalk.yellow('  Low:'), audit.metadata.vulnerabilities.low || 0);
        console.log(chalk.green('\nRun'), chalk.bold('npm audit fix'), chalk.green('to fix issues'));
      } else {
        console.log(chalk.green('\n✔ No security vulnerabilities found'));
      }
    } catch {
      console.log(chalk.yellow('\nSecurity audit unavailable'));
    }

    console.log();
  } catch (error) {
    spinner.fail('Failed to check dependencies');
    console.error((error as Error).message);
  }
}