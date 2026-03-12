#!/usr/bin/env node
import { postInstallSetup } from './commands/setup';
import { setupPath, checkNucleonInPath, showPathInstructions } from './core/path-setup';
import chalk from 'chalk';
import * as os from 'os';

async function runPostInstall() {
  try {
    console.log(chalk.bold('\n🎉 Welcome to Nucleon CLI!\n'));
    
    // Check if nucleon is already accessible
    if (checkNucleonInPath()) {
      console.log(chalk.green('✔ Nucleon is already accessible from command line'));
    } else {
      console.log(chalk.yellow('⚠ Setting up PATH for global access...'));
      
      const pathResult = setupPath();
      
      if (pathResult.success) {
        console.log(chalk.green('✔'), pathResult.message);
        
        if (pathResult.requiresRestart) {
          console.log(chalk.yellow('\n⚠ Please restart your terminal or run:'));
          const platform = os.platform();
          if (platform === 'win32') {
            console.log(chalk.cyan('   refreshenv  # or restart terminal'));
          } else {
            console.log(chalk.cyan('   source ~/.bashrc  # or restart terminal'));
          }
        }
      } else {
        console.log(chalk.red('✖'), pathResult.message);
        showPathInstructions(os.platform());
      }
    }

    // Run the setup process
    await postInstallSetup();
    
  } catch (error) {
    console.log(chalk.yellow('Post-install setup encountered an issue:'), (error as Error).message);
    console.log(chalk.gray('You can run setup later with:'), chalk.bold('nucleon setup'));
  }
}

// Run post-install setup
runPostInstall().catch(error => {
  console.error('Post-install setup failed:', error.message);
  process.exit(0); // Don't fail the installation
});