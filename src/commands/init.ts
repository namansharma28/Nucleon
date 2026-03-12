import inquirer from 'inquirer';
import * as fs from 'fs';
import ora from 'ora';
import { logger } from '../core/logger';
import { execSync } from 'child_process';

interface ProjectTemplate {
  command: string;
  postInstall?: () => void;
}

const templates: Record<string, ProjectTemplate> = {
  'Next.js': {
    command: 'npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"',
  },
  'Express API': {
    command: 'npm init -y && npm install express cors dotenv && npm install -D @types/express @types/node typescript',
    postInstall: () => {
      fs.mkdirSync('src', { recursive: true });
      fs.writeFileSync('src/index.ts', `import express from 'express';\nimport cors from 'cors';\nimport dotenv from 'dotenv';\n\ndotenv.config();\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(cors());\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'API is running' });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});\n`);
      fs.writeFileSync('.env.example', 'PORT=3000\n');
    },
  },
  'React + Vite': {
    command: 'npm create vite@latest . -- --template react-ts',
  },
  'Python FastAPI': {
    command: 'pip install fastapi uvicorn',
    postInstall: () => {
      fs.mkdirSync('app', { recursive: true });
      fs.writeFileSync('app/main.py', `from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"message": "Hello from FastAPI"}\n`);
      fs.writeFileSync('requirements.txt', 'fastapi\nuvicorn[standard]\n');
    },
  },
  'CLI Tool': {
    command: 'npm init -y && npm install commander chalk inquirer ora && npm install -D @types/node @types/inquirer typescript',
    postInstall: () => {
      fs.mkdirSync('src', { recursive: true });
      fs.writeFileSync('src/index.ts', `#!/usr/bin/env node\nimport { Command } from 'commander';\n\nconst program = new Command();\n\nprogram\n  .name('my-cli')\n  .description('My CLI tool')\n  .version('1.0.0');\n\nprogram.parse();\n`);
    },
  },
};

export async function initCommand() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'Select project type:',
      choices: Object.keys(templates),
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
    },
  ]);

  const projectName = answers.projectName;
  const template = templates[answers.projectType as keyof typeof templates];

  // Create project directory
  if (!fs.existsSync(projectName)) {
    fs.mkdirSync(projectName, { recursive: true });
  }

  process.chdir(projectName);

  const spinner = ora('Installing framework and dependencies...').start();

  try {
    // Execute installation command
    execSync(template.command, { stdio: 'inherit' });

    // Run post-install setup
    if (template.postInstall) {
      template.postInstall();
    }

    // Initialize Git if not already initialized
    if (!fs.existsSync('.git')) {
      execSync('git init', { stdio: 'ignore' });
      spinner.text = 'Initializing Git repository...';
    }

    // Create .gitignore if it doesn't exist
    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', 'node_modules/\ndist/\nbuild/\n.env\n*.log\n');
    }

    spinner.succeed('Project created successfully!');
    logger.success(`Project "${projectName}" initialized`);
    logger.success('Dependencies installed');
    logger.success('Git repository initialized');
    
    console.log(`\nNext steps:\n  cd ${projectName}\n  Start coding!\n`);
  } catch (error) {
    spinner.fail('Failed to create project');
    logger.error((error as Error).message);
  }
}
