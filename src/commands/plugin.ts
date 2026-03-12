import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
  getInstalledPlugins, 
  installPlugin, 
  uninstallPlugin, 
  executePluginCommand,
  createPluginTemplate 
} from '../core/plugin';

export async function pluginCommand(action?: string, ...args: string[]) {
  switch (action) {
    case 'list':
      listPlugins();
      break;
    case 'install':
      if (args[0]) {
        await installPlugin(args[0], args.includes('--global'));
      } else {
        console.log(chalk.red('Plugin name required'));
      }
      break;
    case 'uninstall':
    case 'remove':
      if (args[0]) {
        uninstallPlugin(args[0]);
      } else {
        console.log(chalk.red('Plugin name required'));
      }
      break;
    case 'create':
      if (args[0]) {
        createPluginTemplate(args[0]);
      } else {
        console.log(chalk.red('Plugin name required'));
      }
      break;
    case 'run':
      if (args[0] && args[1]) {
        executePluginCommand(args[0], args[1], args.slice(2));
      } else {
        console.log(chalk.red('Usage: nucleon plugin run <plugin-name> <command> [args...]'));
      }
      break;
    default:
      await interactivePluginManager();
  }
}

function listPlugins() {
  const plugins = getInstalledPlugins();

  if (plugins.length === 0) {
    console.log(chalk.yellow('No plugins installed'));
    console.log(chalk.cyan('\nInstall plugins with:'), chalk.bold('nucleon plugin install <plugin-name>'));
    return;
  }

  console.log(chalk.bold('\n🔌 Installed Plugins\n'));

  plugins.forEach(plugin => {
    console.log(chalk.green('●'), chalk.bold(plugin.name), chalk.gray(`v${plugin.version}`));
    if (plugin.description) {
      console.log(`  ${plugin.description}`);
    }
    
    const commands = Object.keys(plugin.commands);
    if (commands.length > 0) {
      console.log(chalk.cyan('  Commands:'), commands.join(', '));
    }
    console.log();
  });

  console.log(chalk.cyan('Run plugin commands with:'), chalk.bold('nucleon plugin run <plugin-name> <command>'));
}

async function interactivePluginManager() {
  const plugins = getInstalledPlugins();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Plugin management:',
      choices: [
        'List installed plugins',
        'Install new plugin',
        'Run plugin command',
        'Create plugin template',
        'Uninstall plugin',
        'Exit',
      ],
    },
  ]);

  switch (answers.action) {
    case 'List installed plugins':
      listPlugins();
      break;

    case 'Install new plugin':
      const installAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'pluginName',
          message: 'Plugin name (npm package):',
          validate: (input) => input.trim() ? true : 'Plugin name is required',
        },
        {
          type: 'confirm',
          name: 'global',
          message: 'Install globally?',
          default: false,
        },
      ]);
      await installPlugin(installAnswers.pluginName, installAnswers.global);
      break;

    case 'Run plugin command':
      if (plugins.length === 0) {
        console.log(chalk.yellow('No plugins installed'));
        break;
      }

      const runAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'plugin',
          message: 'Select plugin:',
          choices: plugins.map(p => p.name),
        },
      ]);

      const selectedPlugin = plugins.find(p => p.name === runAnswers.plugin);
      const commands = Object.keys(selectedPlugin?.commands || {});

      if (commands.length === 0) {
        console.log(chalk.yellow('No commands available for this plugin'));
        break;
      }

      const commandAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'command',
          message: 'Select command:',
          choices: commands,
        },
      ]);

      executePluginCommand(runAnswers.plugin, commandAnswers.command);
      break;

    case 'Create plugin template':
      const createAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'pluginName',
          message: 'Plugin name:',
          validate: (input) => input.trim() ? true : 'Plugin name is required',
        },
      ]);
      createPluginTemplate(createAnswers.pluginName);
      break;

    case 'Uninstall plugin':
      if (plugins.length === 0) {
        console.log(chalk.yellow('No plugins installed'));
        break;
      }

      const uninstallAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'plugin',
          message: 'Select plugin to uninstall:',
          choices: plugins.map(p => p.name),
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure?',
          default: false,
        },
      ]);

      if (uninstallAnswers.confirm) {
        uninstallPlugin(uninstallAnswers.plugin);
      }
      break;
  }
}