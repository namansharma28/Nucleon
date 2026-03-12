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
    postInstall: () => {
      // Create professional Next.js structure
      const dirs = [
        'components/ui',
        'components/layout',
        'lib/utils',
        'lib/hooks',
        'types',
        'constants',
        'styles/globals'
      ];
      
      dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
      
      // Create barrel exports
      fs.writeFileSync('components/index.ts', `// Component exports\nexport * from './ui';\nexport * from './layout';\n`);
      fs.writeFileSync('lib/index.ts', `// Library exports\nexport * from './utils';\nexport * from './hooks';\n`);
      
      // Create utility files
      fs.writeFileSync('lib/utils/index.ts', `import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`);
      
      fs.writeFileSync('types/index.ts', `// Global type definitions\nexport interface User {\n  id: string;\n  name: string;\n  email: string;\n}\n`);
      
      fs.writeFileSync('constants/index.ts', `// Application constants\nexport const APP_NAME = 'My Next.js App';\nexport const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';\n`);
    },
  },
  'Express API': {
    command: 'npm init -y && npm install express cors dotenv helmet morgan bcryptjs jsonwebtoken && npm install -D @types/express @types/node @types/cors @types/bcryptjs @types/jsonwebtoken @types/morgan typescript ts-node nodemon',
    postInstall: () => {
      // Create professional Express structure
      const dirs = [
        'src/controllers',
        'src/routes',
        'src/services',
        'src/models',
        'src/middlewares',
        'src/config',
        'src/utils',
        'tests/unit',
        'tests/integration'
      ];
      
      dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
      
      // App configuration
      fs.writeFileSync('src/app.ts', `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFound } from './middlewares/notFound.middleware';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
`);

      // Server entry point
      fs.writeFileSync('src/server.ts', `import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(\`🚀 Server running on port \${PORT}\`);
      console.log(\`📊 Health check: http://localhost:\${PORT}/health\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
`);

      // User controller
      fs.writeFileSync('src/controllers/user.controller.ts', `import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    res.json({ success: true, data: user });
  });

  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    const user = await UserService.createUser(userData);
    res.status(201).json({ success: true, data: user });
  });
}
`);

      // User routes
      fs.writeFileSync('src/routes/user.routes.ts', `import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUser } from '../middlewares/validation.middleware';

const router = Router();

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', validateUser, UserController.createUser);

export default router;
`);

      // User service
      fs.writeFileSync('src/services/user.service.ts', `import { User } from '../models/user.model';

export class UserService {
  static async getAllUsers() {
    return User.findAll();
  }

  static async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async createUser(userData: any) {
    return User.create(userData);
  }
}
`);

      // User model
      fs.writeFileSync('src/models/user.model.ts', `export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database for demo
const users: IUser[] = [];

export class User {
  static async findAll(): Promise<IUser[]> {
    return users;
  }

  static async findById(id: string): Promise<IUser | null> {
    return users.find(user => user.id === id) || null;
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const user: IUser = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  }
}
`);

      // Middlewares
      fs.writeFileSync('src/middlewares/error.middleware.ts', `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.stack);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};
`);

      fs.writeFileSync('src/middlewares/notFound.middleware.ts', `import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: \`Route \${req.originalUrl} not found\`
  });
};
`);

      fs.writeFileSync('src/middlewares/validation.middleware.ts', `import { Request, Response, NextFunction } from 'express';

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  next();
};
`);

      // Config
      fs.writeFileSync('src/config/database.ts', `export const connectDB = async () => {
  // Database connection logic here
  console.log('📦 Database connected');
};
`);

      // Utils
      fs.writeFileSync('src/utils/asyncHandler.ts', `import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
`);

      // Environment file
      fs.writeFileSync('.env.example', `NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
`);

      // Package.json scripts update
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      packageJson.scripts = {
        ...packageJson.scripts,
        "dev": "nodemon src/server.ts",
        "build": "tsc",
        "start": "node dist/server.js",
        "test": "jest"
      };
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

      // TypeScript config
      fs.writeFileSync('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`);
    },
  },
  'React + Vite': {
    command: 'npm create vite@latest . -- --template react-ts',
    postInstall: () => {
      // Create professional React structure
      const dirs = [
        'src/components/ui',
        'src/components/layout',
        'src/hooks',
        'src/services',
        'src/utils',
        'src/types',
        'src/constants',
        'src/contexts',
        'src/pages',
        'src/assets/images',
        'src/assets/icons'
      ];
      
      dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
      
      // Create barrel exports
      fs.writeFileSync('src/components/index.ts', `// Component exports\nexport * from './ui';\nexport * from './layout';\n`);
      fs.writeFileSync('src/hooks/index.ts', `// Custom hooks\nexport * from './useLocalStorage';\n`);
      fs.writeFileSync('src/services/index.ts', `// API services\nexport * from './api';\n`);
      
      // Custom hook example
      fs.writeFileSync('src/hooks/useLocalStorage.ts', `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
`);

      // API service
      fs.writeFileSync('src/services/api.ts', `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = \`\${API_BASE_URL}\${endpoint}\`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
`);

      // Types
      fs.writeFileSync('src/types/index.ts', `// Global type definitions
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
`);

      // Constants
      fs.writeFileSync('src/constants/index.ts', `// Application constants
export const APP_NAME = 'My React App';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
`);
    },
  },
  'Python FastAPI': {
    command: 'pip install fastapi uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv',
    postInstall: () => {
      // Create professional FastAPI structure
      const dirs = [
        'app/api/routes',
        'app/controllers',
        'app/services',
        'app/models',
        'app/schemas',
        'app/core',
        'app/utils',
        'tests/unit',
        'tests/integration'
      ];
      
      dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));

      // Main app
      fs.writeFileSync('app/main.py', `from fastapi import FastAPI
from app.api.routes import user_routes
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Professional FastAPI application"
)

# Health check
@app.get("/health")
def health_check():
    return {"status": "OK", "version": settings.VERSION}

# Include routers
app.include_router(user_routes.router, prefix="/api/users", tags=["users"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
`);

      // User routes
      fs.writeFileSync('app/api/routes/user_routes.py', `from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.controllers.user_controller import UserController
from app.schemas.user_schema import User, UserCreate, UserResponse

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_users():
    return UserController.get_all_users()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    user = UserController.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    return UserController.create_user(user)
`);

      // User controller
      fs.writeFileSync('app/controllers/user_controller.py', `from typing import List, Optional
from app.services.user_service import UserService
from app.schemas.user_schema import User, UserCreate

class UserController:
    @staticmethod
    def get_all_users() -> List[User]:
        return UserService.get_all_users()
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[User]:
        return UserService.get_user_by_id(user_id)
    
    @staticmethod
    def create_user(user_data: UserCreate) -> User:
        return UserService.create_user(user_data)
`);

      // User service
      fs.writeFileSync('app/services/user_service.py', `from typing import List, Optional
from app.models.user_model import UserModel
from app.schemas.user_schema import User, UserCreate

class UserService:
    @staticmethod
    def get_all_users() -> List[User]:
        return UserModel.find_all()
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[User]:
        return UserModel.find_by_id(user_id)
    
    @staticmethod
    def create_user(user_data: UserCreate) -> User:
        return UserModel.create(user_data)
`);

      // User model
      fs.writeFileSync('app/models/user_model.py', `from typing import List, Optional
from datetime import datetime
from app.schemas.user_schema import User, UserCreate

# Mock database for demo
users_db: List[User] = []

class UserModel:
    @staticmethod
    def find_all() -> List[User]:
        return users_db
    
    @staticmethod
    def find_by_id(user_id: str) -> Optional[User]:
        return next((user for user in users_db if user.id == user_id), None)
    
    @staticmethod
    def create(user_data: UserCreate) -> User:
        user = User(
            id=str(len(users_db) + 1),
            name=user_data.name,
            email=user_data.email,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        users_db.append(user)
        return user
`);

      // User schemas
      fs.writeFileSync('app/schemas/user_schema.py', `from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True
`);

      // Core config
      fs.writeFileSync('app/core/config.py', `from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Professional App"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
`);

      // Utils
      fs.writeFileSync('app/utils/logger.py', `import logging
from datetime import datetime

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger
`);

      // Requirements
      fs.writeFileSync('requirements.txt', `fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
pydantic-settings==2.0.3
email-validator==2.1.0
`);

      // Environment file
      fs.writeFileSync('.env.example', `PROJECT_NAME="FastAPI Professional App"
VERSION="1.0.0"
DATABASE_URL="sqlite:///./app.db"
SECRET_KEY="your-secret-key-here"
ACCESS_TOKEN_EXPIRE_MINUTES=30
`);
    },
  },
  'CLI Tool': {
    command: 'npm init -y && npm install commander chalk inquirer ora && npm install -D @types/node @types/inquirer typescript ts-node',
    postInstall: () => {
      // Create professional CLI structure
      const dirs = [
        'src/commands',
        'src/core',
        'src/utils',
        'src/types',
        'tests'
      ];
      
      dirs.forEach(dir => fs.mkdirSync(dir, { recursive: true }));

      // Main CLI entry
      fs.writeFileSync('src/index.ts', `#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { buildCommand } from './commands/build';

const program = new Command();

program
  .name('my-cli')
  .description('Professional CLI tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .action(initCommand);

program
  .command('build')
  .description('Build the project')
  .action(buildCommand);

program.parse();
`);

      // Commands
      fs.writeFileSync('src/commands/init.ts', `import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../core/logger';

export async function initCommand() {
  console.log(chalk.bold('🚀 Initializing new project...\\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project'
    }
  ]);
  
  logger.success(\`Project \${answers.projectName} initialized!\`);
}
`);

      fs.writeFileSync('src/commands/build.ts', `import ora from 'ora';
import { logger } from '../core/logger';

export async function buildCommand() {
  const spinner = ora('Building project...').start();
  
  // Simulate build process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  spinner.succeed('Build completed!');
  logger.success('Project built successfully!');
}
`);

      // Core utilities
      fs.writeFileSync('src/core/logger.ts', `import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✔'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✖'), message),
};
`);

      // Package.json scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      packageJson.bin = { "my-cli": "dist/index.js" };
      packageJson.scripts = {
        ...packageJson.scripts,
        "build": "tsc",
        "dev": "ts-node src/index.ts",
        "start": "node dist/index.js"
      };
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

      // TypeScript config
      fs.writeFileSync('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`);
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
      'Installing framework and dependencies',
      'Creating professional folder structure',
      'Setting up configuration files',
      'Initializing Git repository'
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
      
      progress.nextStep('Framework and dependencies installed');

      // Step 2: Post-install setup
      if (template.postInstall) {
        await withErrorHandling(
          () => new Promise<void>((resolve) => {
            template.postInstall!();
            resolve();
          }),
          'Professional structure setup failed'
        );
      }
      
      progress.nextStep('Professional folder structure created');

      // Step 3: Create configuration files
      if (!fs.existsSync('.gitignore')) {
        const gitignoreContent = answers.projectType === 'Python FastAPI' 
          ? '__pycache__/\n*.py[cod]\n*$py.class\n*.so\n.Python\nbuild/\ndevelop-eggs/\ndist/\ndownloads/\neggs/\n.eggs/\nlib/\nlib64/\nparts/\nsdist/\nvar/\nwheels/\n*.egg-info/\n.installed.cfg\n*.egg\nPIPFILE.lock\n.env\n.venv\nenv/\nvenv/\nENV/\nenv.bak/\nvenv.bak/\n'
          : 'node_modules/\ndist/\nbuild/\n.env\n*.log\n.DS_Store\ncoverage/\n.nyc_output/\n';
        fs.writeFileSync('.gitignore', gitignoreContent);
      }
      
      progress.nextStep('Configuration files created');

      // Step 4: Initialize Git
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

      progress.complete(`Project "${projectName}" created successfully!`);

      console.log(chalk.bold('\n🎉 Professional Project Ready!\n'));
      console.log(chalk.cyan('📁 Project Structure:'));
      
      if (answers.projectType === 'Express API') {
        console.log(chalk.gray('  src/'));
        console.log(chalk.gray('  ├── controllers/    # Request handlers'));
        console.log(chalk.gray('  ├── routes/         # API endpoints'));
        console.log(chalk.gray('  ├── services/       # Business logic'));
        console.log(chalk.gray('  ├── models/         # Data models'));
        console.log(chalk.gray('  ├── middlewares/    # Custom middleware'));
        console.log(chalk.gray('  └── config/         # App configuration'));
      } else if (answers.projectType === 'Python FastAPI') {
        console.log(chalk.gray('  app/'));
        console.log(chalk.gray('  ├── api/routes/     # API endpoints'));
        console.log(chalk.gray('  ├── controllers/    # Request handlers'));
        console.log(chalk.gray('  ├── services/       # Business logic'));
        console.log(chalk.gray('  ├── models/         # Data models'));
        console.log(chalk.gray('  ├── schemas/        # Pydantic schemas'));
        console.log(chalk.gray('  └── core/           # App configuration'));
      } else if (answers.projectType === 'Next.js') {
        console.log(chalk.gray('  components/'));
        console.log(chalk.gray('  ├── ui/             # Reusable UI components'));
        console.log(chalk.gray('  └── layout/         # Layout components'));
        console.log(chalk.gray('  lib/'));
        console.log(chalk.gray('  ├── utils/          # Utility functions'));
        console.log(chalk.gray('  └── hooks/          # Custom React hooks'));
      } else if (answers.projectType === 'React + Vite') {
        console.log(chalk.gray('  src/'));
        console.log(chalk.gray('  ├── components/     # React components'));
        console.log(chalk.gray('  ├── hooks/          # Custom hooks'));
        console.log(chalk.gray('  ├── services/       # API services'));
        console.log(chalk.gray('  └── utils/          # Utility functions'));
      }
      
      console.log(chalk.cyan('\n🚀 Next steps:'));
      console.log(chalk.gray(`  cd ${projectName}`));
      
      if (answers.projectType === 'Next.js') {
        console.log(chalk.gray('  npm run dev         # Start development server'));
      } else if (answers.projectType === 'React + Vite') {
        console.log(chalk.gray('  npm run dev         # Start development server'));
      } else if (answers.projectType === 'Express API') {
        console.log(chalk.gray('  npm run dev         # Start development server'));
        console.log(chalk.gray('  npm run build       # Build for production'));
      } else if (answers.projectType === 'Python FastAPI') {
        console.log(chalk.gray('  python app/main.py  # Start development server'));
        console.log(chalk.gray('  # or'));
        console.log(chalk.gray('  uvicorn app.main:app --reload'));
      } else if (answers.projectType === 'CLI Tool') {
        console.log(chalk.gray('  npm run build       # Build the CLI'));
        console.log(chalk.gray('  npm link            # Link globally'));
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
