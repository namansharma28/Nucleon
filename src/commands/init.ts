import inquirer from 'inquirer';
import * as fs from 'fs';
import chalk from 'chalk';
import { logger } from '../core/logger';
import { execSync } from 'child_process';
import { createMultiStepProgress } from '../core/progress';
import { handleError, ErrorTypes, withErrorHandling } from '../core/errors';

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
  try {
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
        validate: (input) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
          return true;
        },
      },
    ]);

    const projectName = answers.projectName;
    const template = templates[answers.projectType as keyof typeof templates];

    if (!template) {
      throw ErrorTypes.INVALID_PROJECT_TYPE(answers.projectType);
    }

    // Create project directory
    if (!fs.existsSync(projectName)) {
      fs.mkdirSync(projectName, { recursive: true });
    }

    process.chdir(projectName);

    // Multi-step progress
    const progress = createMultiStepProgress([
      'Installing framework',
      'Setting up project structure',
      'Initializing Git repository',
      'Creating configuration files'
    ]);

    progress.start();

    try {
      // Step 1: Install framework
      await withErrorHandling(
        () => new Promise<void>((resolve, reject) => {
          try {
            execSync(template.command, { stdio: 'pipe' });
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        'Framework installation failed',
        [
          'Check your internet connection',
          'Ensure you have the required tools installed',
          'Try running the command manually'
        ]
      );
      
      progress.nextStep('Framework installed successfully');

      // Step 2: Post-install setup
      if (template.postInstall) {
        await withErrorHandling(
          () => new Promise<void>((resolve) => {
            template.postInstall!();
            resolve();
          }),
          'Project structure setup failed'
        );
      }
      
      progress.nextStep('Project structure created');

      // Step 3: Initialize Git
      if (!fs.existsSync('.git')) {
        await withErrorHandling(
          () => new Promise<void>((resolve, reject) => {
            try {
              execSync('git init', { stdio: 'ignore' });
              resolve();
            } catch (error) {
              reject(error);
            }
          }),
          'Git initialization failed',
          ['Ensure Git is installed', 'Check if you have write permissions']
        );
      }
      
      progress.nextStep('Git repository initialized');

      // Step 4: Create configuration files
      if (!fs.existsSync('.gitignore')) {
        fs.writeFileSync('.gitignore', 'node_modules/\ndist/\nbuild/\n.env\n*.log\n');
      }
      
      progress.nextStep('Configuration files created');

      progress.complete(`Project "${projectName}" created successfully!`);

      console.log(chalk.bold('\n🎉 Project Ready!\n'));
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.gray(`  cd ${projectName}`));
      console.log(chalk.gray('  Start coding!'));
      
      if (answers.projectType === 'Next.js') {
        console.log(chalk.gray('  npm run dev  # Start development server'));
      } else if (answers.projectType === 'React + Vite') {
        console.log(chalk.gray('  npm run dev  # Start development server'));
      } else if (answers.projectType === 'Express API') {
        console.log(chalk.gray('  npm run build && npm start  # Start API server'));
      }
      
      console.log();

    } catch (error) {
      progress.fail('Project initialization failed');
      throw error;
    }

  } catch (error) {
    handleError(error as Error);
  }
}
