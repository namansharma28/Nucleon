import chalk from 'chalk';

export class NucleonError extends Error {
  public code: string;
  public context?: Record<string, any>;
  public suggestions?: string[];

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context?: Record<string, any>,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'NucleonError';
    this.code = code;
    this.context = context;
    this.suggestions = suggestions;
  }
}

export function createError(
  message: string,
  code: string,
  context?: Record<string, any>,
  suggestions?: string[]
): NucleonError {
  return new NucleonError(message, code, context, suggestions);
}

export function handleError(error: Error | NucleonError): void {
  console.log(); // Add spacing

  if (error instanceof NucleonError) {
    // Enhanced error display for NucleonError
    console.log(chalk.red('❌'), chalk.bold(error.message));
    
    if (error.context) {
      console.log(chalk.gray('\nContext:'));
      Object.entries(error.context).forEach(([key, value]) => {
        console.log(chalk.gray(`  ${key}:`), value);
      });
    }

    if (error.suggestions && error.suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 Suggestions:'));
      error.suggestions.forEach(suggestion => {
        console.log(chalk.yellow('  •'), suggestion);
      });
    }

    console.log(chalk.gray(`\nError Code: ${error.code}`));
  } else {
    // Standard error display
    console.log(chalk.red('❌'), error.message);
  }

  console.log(); // Add spacing
}

// Specific error creators for common scenarios
export const ErrorTypes = {
  VERCEL_NOT_INSTALLED: () => createError(
    'Vercel CLI not found',
    'VERCEL_NOT_INSTALLED',
    { required: 'vercel' },
    [
      'Install Vercel CLI: npm install -g vercel',
      'Run nucleon setup to install automatically',
      'Visit https://vercel.com/cli for manual installation'
    ]
  ),

  VERCEL_DEPLOYMENT_FAILED: (reason: string) => createError(
    `Vercel deployment failed: ${reason}`,
    'VERCEL_DEPLOYMENT_FAILED',
    { reason },
    [
      'Check your environment variables',
      'Ensure your build script works locally',
      'Run vercel logs for detailed error information',
      'Verify your project is linked: nucleon vercel link'
    ]
  ),

  GIT_NOT_REPOSITORY: () => createError(
    'Not a git repository',
    'GIT_NOT_REPOSITORY',
    { required: 'git' },
    [
      'Initialize git repository: git init',
      'Clone an existing repository',
      'Run nucleon init to create a new project with git'
    ]
  ),

  GIT_UNCOMMITTED_CHANGES: () => createError(
    'Git repository has uncommitted changes',
    'GIT_UNCOMMITTED_CHANGES',
    { status: 'dirty' },
    [
      'Commit your changes: git add . && git commit -m "message"',
      'Stash changes: git stash',
      'Use --force flag to deploy anyway (not recommended)'
    ]
  ),

  PROJECT_NOT_LINKED: () => createError(
    'Project not linked to Vercel',
    'PROJECT_NOT_LINKED',
    { platform: 'vercel' },
    [
      'Link project: nucleon vercel link',
      'Create new Vercel project from dashboard',
      'Check if you\'re in the correct directory'
    ]
  ),

  MISSING_PACKAGE_JSON: () => createError(
    'No package.json found',
    'MISSING_PACKAGE_JSON',
    { required: 'package.json' },
    [
      'Initialize npm project: npm init',
      'Run nucleon init to create a new project',
      'Ensure you\'re in the correct directory'
    ]
  ),

  MISSING_BUILD_SCRIPT: () => createError(
    'No build script found in package.json',
    'MISSING_BUILD_SCRIPT',
    { required: 'build script' },
    [
      'Add build script to package.json',
      'For Next.js: "build": "next build"',
      'For React: "build": "react-scripts build"',
      'For Vite: "build": "vite build"'
    ]
  ),

  NETWORK_ERROR: (operation: string) => createError(
    `Network error during ${operation}`,
    'NETWORK_ERROR',
    { operation },
    [
      'Check your internet connection',
      'Try again in a few moments',
      'Check if the service is down',
      'Use a VPN if you\'re behind a firewall'
    ]
  ),

  PERMISSION_DENIED: (path: string) => createError(
    `Permission denied: ${path}`,
    'PERMISSION_DENIED',
    { path },
    [
      'Run with administrator/sudo privileges',
      'Check file permissions',
      'Ensure you own the directory',
      'Try running from a different location'
    ]
  ),

  INVALID_PROJECT_TYPE: (type: string) => createError(
    `Invalid project type: ${type}`,
    'INVALID_PROJECT_TYPE',
    { type, available: ['Next.js', 'React+Vite', 'Express API', 'Python FastAPI', 'CLI Tool'] },
    [
      'Choose from available project types',
      'Run nucleon init for interactive selection',
      'Check spelling of project type'
    ]
  ),

  UPDATE_FAILED: (reason: string) => createError(
    `Update failed: ${reason}`,
    'UPDATE_FAILED',
    { reason },
    [
      'Try updating manually: npm install -g nucleon-cli@latest',
      'Check your npm permissions',
      'Clear npm cache: npm cache clean --force',
      'Restart terminal and try again'
    ]
  ),

  PATH_SETUP_FAILED: (platform: string) => createError(
    `Failed to setup PATH on ${platform}`,
    'PATH_SETUP_FAILED',
    { platform },
    [
      'Add npm global bin to PATH manually',
      'Restart your terminal',
      'Run nucleon setup again',
      'Check PATH setup instructions in documentation'
    ]
  )
};

// Utility function to wrap async operations with better error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  suggestions?: string[]
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof NucleonError) {
      throw error;
    }
    
    throw createError(
      `${errorMessage}: ${(error as Error).message}`,
      'OPERATION_FAILED',
      { originalError: (error as Error).message },
      suggestions
    );
  }
}