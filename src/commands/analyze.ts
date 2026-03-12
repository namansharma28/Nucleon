import chalk from 'chalk';
import ora from 'ora';
import { analyzeProject } from '../core/analyzer';

export function analyzeCommand() {
  const spinner = ora('Analyzing project...').start();

  try {
    const result = analyzeProject(process.cwd());
    spinner.succeed('Analysis complete!');

    console.log(chalk.bold('\n📊 Project Health Report\n'));
    
    // Basic info
    console.log(chalk.cyan('Language:'), result.language);
    if (result.framework) {
      console.log(chalk.cyan('Framework:'), result.framework);
    }
    console.log(chalk.cyan('Total Files:'), result.totalFiles);
    console.log(chalk.cyan('Code Files:'), result.codeFiles);
    console.log(chalk.cyan('Test Files:'), result.testFiles);
    console.log(chalk.cyan('Lines of Code:'), result.totalLines.toLocaleString());

    if (result.dependencies) {
      console.log(chalk.cyan('Dependencies:'), result.dependencies.total);
    }

    // Test coverage estimate
    if (result.codeFiles > 0) {
      const testCoverage = Math.round((result.testFiles / result.codeFiles) * 100);
      console.log(chalk.cyan('Test Coverage:'), `~${testCoverage}%`);
    }

    // Folder distribution
    console.log(chalk.bold('\n📁 Folder Distribution\n'));
    Object.entries(result.folderDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([folder, count]) => {
        const displayFolder = folder === '.' ? 'root' : folder;
        console.log(`  ${displayFolder.padEnd(20)} ${count} files`);
      });

    // File types
    if (Object.keys(result.fileTypes).length > 0) {
      console.log(chalk.bold('\n📄 File Types\n'));
      Object.entries(result.fileTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .forEach(([ext, count]) => {
          const displayExt = ext || 'no extension';
          console.log(`  ${displayExt.padEnd(15)} ${count} files`);
        });
    }

    // Largest files
    if (result.largestFiles.length > 0) {
      console.log(chalk.bold('\n📈 Largest Files\n'));
      result.largestFiles.forEach((file, index) => {
        console.log(`  ${(index + 1).toString().padEnd(3)} ${file.path.padEnd(30)} ${file.lines} lines`);
      });
    }

    // Warnings
    if (result.warnings.length > 0) {
      console.log(chalk.bold('\n⚠️  Warnings\n'));
      result.warnings.forEach((warning) => {
        console.log(chalk.yellow('  ⚠'), warning);
      });
    }

    // Suggestions
    if (result.suggestions.length > 0) {
      console.log(chalk.bold('\n💡 Suggestions\n'));
      result.suggestions.forEach((suggestion) => {
        console.log(chalk.green('  •'), suggestion);
      });
    }

    console.log();
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error((error as Error).message);
  }
}
