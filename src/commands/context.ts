import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';

interface ProjectContext {
  name: string;
  framework?: string;
  language: string;
  database?: string;
  deployment?: string;
  lastDeploy?: string;
  team?: string[];
  notes?: string;
  created: string;
  updated: string;
}

const CONTEXT_FILE = '.nucleon-context.json';

function loadContext(): ProjectContext | null {
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

function saveContext(context: ProjectContext): void {
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
}

function detectProjectInfo(): Partial<ProjectContext> {
  const info: Partial<ProjectContext> = {};

  // Detect from package.json
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      info.name = pkg.name || path.basename(process.cwd());
      info.language = 'JavaScript/TypeScript';

      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['next']) info.framework = 'Next.js';
      else if (deps['react']) info.framework = 'React';
      else if (deps['express']) info.framework = 'Express';
      else if (deps['vue']) info.framework = 'Vue';

      if (deps['mongodb'] || deps['mongoose']) info.database = 'MongoDB';
      else if (deps['pg'] || deps['postgres']) info.database = 'PostgreSQL';
      else if (deps['mysql']) info.database = 'MySQL';
      else if (deps['sqlite3']) info.database = 'SQLite';
    } catch {}
  }

  // Detect from Python files
  if (fs.existsSync('requirements.txt')) {
    info.language = 'Python';
    try {
      const reqs = fs.readFileSync('requirements.txt', 'utf-8');
      if (reqs.includes('fastapi')) info.framework = 'FastAPI';
      else if (reqs.includes('django')) info.framework = 'Django';
      else if (reqs.includes('flask')) info.framework = 'Flask';
    } catch {}
  }

  // Detect deployment
  if (fs.existsSync('vercel.json') || fs.existsSync('.vercel')) {
    info.deployment = 'Vercel';
  } else if (fs.existsSync('netlify.toml')) {
    info.deployment = 'Netlify';
  } else if (fs.existsSync('Dockerfile')) {
    info.deployment = 'Docker';
  }

  return info;
}

export async function contextCommand(action?: string) {
  switch (action) {
    case 'show':
      showContext();
      break;
    case 'edit':
      await editContext();
      break;
    case 'init':
      await initContext();
      break;
    default:
      showContext();
  }
}

function showContext() {
  const context = loadContext();

  if (!context) {
    console.log(chalk.yellow('No project context found. Run'), chalk.bold('nucleon context init'), chalk.yellow('to create one.'));
    return;
  }

  console.log(chalk.bold('\n📋 Project Context\n'));
  console.log(chalk.cyan('Project:'), context.name);
  if (context.framework) console.log(chalk.cyan('Framework:'), context.framework);
  console.log(chalk.cyan('Language:'), context.language);
  if (context.database) console.log(chalk.cyan('Database:'), context.database);
  if (context.deployment) console.log(chalk.cyan('Deployment:'), context.deployment);
  if (context.lastDeploy) console.log(chalk.cyan('Last Deploy:'), new Date(context.lastDeploy).toLocaleDateString());
  if (context.team && context.team.length > 0) {
    console.log(chalk.cyan('Team:'), context.team.join(', '));
  }
  if (context.notes) {
    console.log(chalk.cyan('Notes:'), context.notes);
  }

  console.log(chalk.gray('\nCreated:'), new Date(context.created).toLocaleDateString());
  console.log(chalk.gray('Updated:'), new Date(context.updated).toLocaleDateString());
  console.log();
}

async function initContext() {
  const detected = detectProjectInfo();
  
  console.log(chalk.bold('\n🔍 Auto-detected project info:\n'));
  Object.entries(detected).forEach(([key, value]) => {
    if (value) console.log(chalk.green('✔'), `${key}: ${value}`);
  });

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: detected.name || path.basename(process.cwd()),
    },
    {
      type: 'input',
      name: 'framework',
      message: 'Framework:',
      default: detected.framework,
    },
    {
      type: 'input',
      name: 'language',
      message: 'Primary language:',
      default: detected.language || 'JavaScript',
    },
    {
      type: 'input',
      name: 'database',
      message: 'Database:',
      default: detected.database,
    },
    {
      type: 'input',
      name: 'deployment',
      message: 'Deployment platform:',
      default: detected.deployment,
    },
    {
      type: 'input',
      name: 'team',
      message: 'Team members (comma-separated):',
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Additional notes:',
    },
  ]);

  const context: ProjectContext = {
    name: answers.name,
    framework: answers.framework || undefined,
    language: answers.language,
    database: answers.database || undefined,
    deployment: answers.deployment || undefined,
    team: answers.team ? answers.team.split(',').map((m: string) => m.trim()).filter(Boolean) : undefined,
    notes: answers.notes || undefined,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  saveContext(context);
  console.log(chalk.green('\n✔ Project context saved!'));
}

async function editContext() {
  const context = loadContext();

  if (!context) {
    console.log(chalk.yellow('No context found. Run'), chalk.bold('nucleon context init'), chalk.yellow('first.'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: context.name,
    },
    {
      type: 'input',
      name: 'framework',
      message: 'Framework:',
      default: context.framework,
    },
    {
      type: 'input',
      name: 'database',
      message: 'Database:',
      default: context.database,
    },
    {
      type: 'input',
      name: 'deployment',
      message: 'Deployment platform:',
      default: context.deployment,
    },
    {
      type: 'input',
      name: 'team',
      message: 'Team members (comma-separated):',
      default: context.team?.join(', '),
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Additional notes:',
      default: context.notes,
    },
  ]);

  const updatedContext: ProjectContext = {
    ...context,
    name: answers.name,
    framework: answers.framework || undefined,
    database: answers.database || undefined,
    deployment: answers.deployment || undefined,
    team: answers.team ? answers.team.split(',').map((m: string) => m.trim()).filter(Boolean) : undefined,
    notes: answers.notes || undefined,
    updated: new Date().toISOString(),
  };

  saveContext(updatedContext);
  console.log(chalk.green('\n✔ Project context updated!'));
}