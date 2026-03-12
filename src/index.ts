#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { doctorCommand } from './commands/doctor';
import { analyzeCommand } from './commands/analyze';
import { commitCommand } from './commands/commit';
import { statsCommand } from './commands/stats';
import { depsCommand } from './commands/deps';
import { summaryCommand } from './commands/summary';
import { taskCommand } from './commands/task';
import { contextCommand } from './commands/context';
import { gitCommand } from './commands/git';
import { pluginCommand } from './commands/plugin';
import { structureCommand } from './commands/structure';
import { configCommand } from './commands/config';
import { vercelCommand } from './commands/vercel';
import { setupCommand } from './commands/setup';
import { updateCommand, runBackgroundUpdateCheck } from './commands/update';
import { showBanner } from './core/logger';

const program = new Command();

program
  .name('nucleon')
  .description('⚡ Nucleon CLI — Developer Workflow Engine')
  .version('1.0.6')
  .action(() => {
    showBanner();
  });

// Auto-update system
program
  .command('update')
  .description('Update Nucleon to the latest version')
  .action(() => updateCommand());

program
  .command('version')
  .description('Show version information')
  .action(() => updateCommand('version'));

// Setup command
program
  .command('setup')
  .description('Setup development environment and install dependencies')
  .option('--skip-vercel', 'Skip Vercel CLI installation')
  .option('--skip-optional', 'Skip optional tools installation')
  .option('--skip-path', 'Skip PATH configuration')
  .action((options) => setupCommand(options));

// Core commands
program
  .command('init')
  .description('Initialize a new project with framework installation')
  .action(initCommand);

program
  .command('doctor')
  .description('Check developer environment and dependencies')
  .action(doctorCommand);

program
  .command('analyze')
  .description('Comprehensive project health analysis')
  .action(analyzeCommand);

program
  .command('commit')
  .description('Generate smart commit messages')
  .action(commitCommand);

// Project visualization
program
  .command('structure')
  .description('Visualize project architecture and dependencies')
  .action(structureCommand);

// Quick deploy command (alias for vercel deploy)
program
  .command('deploy')
  .description('Deploy to Vercel with smart checks')
  .action(() => vercelCommand('deploy'));

// Configuration management
const configCmd = program
  .command('config')
  .description('Project configuration management')
  .action(() => configCommand());

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => configCommand('show'));

configCmd
  .command('init')
  .description('Initialize project configuration')
  .action(() => configCommand('init'));

configCmd
  .command('edit')
  .description('Edit configuration interactively')
  .action(() => configCommand('edit'));

configCmd
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key, value) => configCommand('set', key, value));

configCmd
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => configCommand('get', key));

// Vercel deployment
const vercelCmd = program
  .command('vercel')
  .description('Clean Vercel deployment workflow')
  .action(() => vercelCommand());

vercelCmd
  .command('link')
  .description('Link project to Vercel')
  .action(() => vercelCommand('link'));

vercelCmd
  .command('deploy')
  .description('Deploy to Vercel with smart checks')
  .action(() => vercelCommand('deploy'));

vercelCmd
  .command('status')
  .description('Check deployment status')
  .action(() => vercelCommand('status'));

vercelCmd
  .command('open')
  .description('Open Vercel dashboard')
  .action(() => vercelCommand('open'));

// Statistics and insights
program
  .command('stats')
  .description('Show project statistics and metrics')
  .action(statsCommand);

program
  .command('deps')
  .description('Check dependencies and security vulnerabilities')
  .action(depsCommand);

program
  .command('summary')
  .description('Daily development activity summary')
  .action(summaryCommand);

// Task management
const taskCmd = program
  .command('task')
  .description('Lightweight task management')
  .action(() => taskCommand());

taskCmd
  .command('add <title>')
  .description('Add a new task')
  .action((title) => taskCommand('add', title));

taskCmd
  .command('list')
  .description('List all tasks')
  .action(() => taskCommand('list'));

taskCmd
  .command('done <id>')
  .description('Mark task as completed')
  .action((id) => taskCommand('done', id));

taskCmd
  .command('start <id>')
  .description('Start working on a task')
  .action((id) => taskCommand('start', id));

taskCmd
  .command('remove <id>')
  .description('Remove a task')
  .action((id) => taskCommand('remove', id));

// Project context
const contextCmd = program
  .command('context')
  .description('Project context and metadata')
  .action(() => contextCommand());

contextCmd
  .command('show')
  .description('Show project context')
  .action(() => contextCommand('show'));

contextCmd
  .command('init')
  .description('Initialize project context')
  .action(() => contextCommand('init'));

contextCmd
  .command('edit')
  .description('Edit project context')
  .action(() => contextCommand('edit'));

// Git workflow
const gitCmd = program
  .command('git')
  .description('Enhanced Git workflow tools')
  .action(() => gitCommand());

gitCmd
  .command('sync')
  .description('Sync with remote (fetch, pull, push)')
  .action(() => gitCommand('sync'));

gitCmd
  .command('smart-commit')
  .description('Intelligent commit with analysis')
  .action(() => gitCommand('smart-commit'));

gitCmd
  .command('branches')
  .description('View and manage branches')
  .action(() => gitCommand('branches'));

gitCmd
  .command('status')
  .description('Enhanced status overview')
  .action(() => gitCommand('status'));

// Plugin system
const pluginCmd = program
  .command('plugin')
  .description('Plugin management system')
  .action(() => pluginCommand());

pluginCmd
  .command('list')
  .description('List installed plugins')
  .action(() => pluginCommand('list'));

pluginCmd
  .command('install <name>')
  .description('Install a plugin')
  .option('--global', 'Install globally')
  .action((name, options) => pluginCommand('install', name, options.global ? '--global' : ''));

pluginCmd
  .command('uninstall <name>')
  .description('Uninstall a plugin')
  .action((name) => pluginCommand('uninstall', name));

pluginCmd
  .command('create <name>')
  .description('Create a plugin template')
  .action((name) => pluginCommand('create', name));

pluginCmd
  .command('run <plugin> <command> [args...]')
  .description('Run a plugin command')
  .action((plugin, command, args) => pluginCommand('run', plugin, command, ...args));

// Background update check (runs silently)
runBackgroundUpdateCheck();

program.parse();