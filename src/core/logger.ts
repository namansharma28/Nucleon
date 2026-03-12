import chalk from 'chalk';

export function showBanner() {
  console.log(chalk.cyan(`
███╗   ██╗██╗   ██╗ ██████╗██╗     ███████╗ ██████╗ ███╗   ██╗
████╗  ██║██║   ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗  ██║
██╔██╗ ██║██║   ██║██║     ██║     █████╗  ██║   ██║██╔██╗ ██║
██║╚██╗██║██║   ██║██║     ██║     ██╔══╝  ██║   ██║██║╚██╗██║
██║ ╚████║╚██████╔╝╚██████╗███████╗███████╗╚██████╔╝██║ ╚████║
╚═╝  ╚═══╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
  `));
  console.log(chalk.bold('⚡ Nucleon CLI — Developer Workflow Engine\n'));
  console.log('Core Commands:');
  console.log(chalk.green('  nucleon init') + '      - Initialize projects with framework installation');
  console.log(chalk.green('  nucleon doctor') + '    - Check developer environment');
  console.log(chalk.green('  nucleon analyze') + '   - Comprehensive project health analysis');
  console.log(chalk.green('  nucleon commit') + '    - Generate smart commit messages');
  
  console.log('\nProject Visualization:');
  console.log(chalk.cyan('  nucleon structure') + ' - Visualize project architecture and dependencies');
  console.log(chalk.cyan('  nucleon config') + '    - Project configuration management');
  
  console.log('\nInsights & Analytics:');
  console.log(chalk.blue('  nucleon stats') + '     - Project statistics and metrics');
  console.log(chalk.blue('  nucleon deps') + '      - Dependency analysis and security');
  console.log(chalk.blue('  nucleon summary') + '   - Daily development activity');
  
  console.log('\nWorkflow Tools:');
  console.log(chalk.yellow('  nucleon task') + '      - Lightweight task management');
  console.log(chalk.yellow('  nucleon context') + '   - Project context and metadata');
  console.log(chalk.yellow('  nucleon git') + '       - Enhanced Git workflow tools');
  
  console.log('\nExtensibility:');
  console.log(chalk.magenta('  nucleon plugin') + '    - Plugin management system\n');
  
  console.log(chalk.gray('Run any command without arguments for interactive mode'));
  console.log(chalk.gray('Use --help with any command for detailed options\n'));
}

export const logger = {
  success: (msg: string) => console.log(chalk.green('✔'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
};
