import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

export interface Plugin {
  name: string;
  version: string;
  description: string;
  commands: Record<string, string>;
  installed: boolean;
  path?: string;
}

const PLUGINS_DIR = path.join(process.cwd(), '.nucleon', 'plugins');
const GLOBAL_PLUGINS_DIR = path.join(require('os').homedir(), '.nucleon', 'plugins');

export function ensurePluginDirs() {
  [PLUGINS_DIR, GLOBAL_PLUGINS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function getInstalledPlugins(): Plugin[] {
  ensurePluginDirs();
  const plugins: Plugin[] = [];

  // Check local plugins
  [PLUGINS_DIR, GLOBAL_PLUGINS_DIR].forEach(pluginDir => {
    if (fs.existsSync(pluginDir)) {
      const pluginFolders = fs.readdirSync(pluginDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      pluginFolders.forEach(folder => {
        const pluginPath = path.join(pluginDir, folder);
        const packagePath = path.join(pluginPath, 'package.json');
        
        if (fs.existsSync(packagePath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            if (pkg.nucleonPlugin) {
              plugins.push({
                name: pkg.name,
                version: pkg.version,
                description: pkg.description || '',
                commands: pkg.nucleonPlugin.commands || {},
                installed: true,
                path: pluginPath,
              });
            }
          } catch {}
        }
      });
    }
  });

  return plugins;
}

export function executePluginCommand(pluginName: string, command: string, args: string[] = []) {
  const plugins = getInstalledPlugins();
  const plugin = plugins.find(p => p.name === pluginName);

  if (!plugin) {
    console.log(chalk.red(`Plugin "${pluginName}" not found`));
    return;
  }

  if (!plugin.commands[command]) {
    console.log(chalk.red(`Command "${command}" not found in plugin "${pluginName}"`));
    return;
  }

  const commandScript = plugin.commands[command];
  const fullCommand = `cd "${plugin.path}" && ${commandScript} ${args.join(' ')}`;

  try {
    execSync(fullCommand, { stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.red(`Plugin command failed: ${(error as Error).message}`));
  }
}

export async function installPlugin(pluginName: string, global = false) {
  const targetDir = global ? GLOBAL_PLUGINS_DIR : PLUGINS_DIR;
  const pluginPath = path.join(targetDir, pluginName);

  console.log(chalk.blue(`Installing plugin: ${pluginName}`));

  try {
    // Try to install from npm
    execSync(`npm install ${pluginName}`, { 
      cwd: targetDir,
      stdio: 'inherit' 
    });

    console.log(chalk.green(`✔ Plugin "${pluginName}" installed successfully`));
  } catch (error) {
    console.log(chalk.red(`Failed to install plugin: ${(error as Error).message}`));
  }
}

export function uninstallPlugin(pluginName: string) {
  const plugins = getInstalledPlugins();
  const plugin = plugins.find(p => p.name === pluginName);

  if (!plugin || !plugin.path) {
    console.log(chalk.red(`Plugin "${pluginName}" not found`));
    return;
  }

  try {
    fs.rmSync(plugin.path, { recursive: true, force: true });
    console.log(chalk.green(`✔ Plugin "${pluginName}" uninstalled`));
  } catch (error) {
    console.log(chalk.red(`Failed to uninstall plugin: ${(error as Error).message}`));
  }
}

export function createPluginTemplate(pluginName: string) {
  const pluginDir = path.join(PLUGINS_DIR, pluginName);
  
  if (fs.existsSync(pluginDir)) {
    console.log(chalk.red(`Plugin directory already exists: ${pluginDir}`));
    return;
  }

  fs.mkdirSync(pluginDir, { recursive: true });

  const packageJson = {
    name: pluginName,
    version: '1.0.0',
    description: `Nucleon plugin: ${pluginName}`,
    main: 'index.js',
    nucleonPlugin: {
      commands: {
        hello: 'node index.js hello',
      },
    },
  };

  const indexJs = `#!/usr/bin/env node
const command = process.argv[2];

switch (command) {
  case 'hello':
    console.log('Hello from ${pluginName} plugin!');
    break;
  default:
    console.log('Available commands: hello');
}
`;

  fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(path.join(pluginDir, 'index.js'), indexJs);

  console.log(chalk.green(`✔ Plugin template created: ${pluginDir}`));
  console.log(chalk.cyan('Edit the files to customize your plugin'));
}