import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';

export interface PathSetupResult {
  success: boolean;
  method: string;
  message: string;
  requiresRestart?: boolean;
}

export function setupPath(): PathSetupResult {
  const platform = os.platform();
  
  try {
    switch (platform) {
      case 'win32':
        return setupWindowsPath();
      case 'darwin':
        return setupMacPath();
      case 'linux':
        return setupLinuxPath();
      default:
        return {
          success: false,
          method: 'unsupported',
          message: `Platform ${platform} not supported for automatic PATH setup`,
        };
    }
  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `Failed to setup PATH: ${(error as Error).message}`,
    };
  }
}

function setupWindowsPath(): PathSetupResult {
  try {
    // Get npm global bin directory
    const npmPrefix = execSync('npm prefix -g', { encoding: 'utf-8' }).trim();
    const npmBin = path.join(npmPrefix, 'node_modules', '.bin');
    
    // Check if already in PATH
    const currentPath = process.env.PATH || '';
    if (currentPath.includes(npmBin)) {
      return {
        success: true,
        method: 'already-configured',
        message: 'npm global bin directory already in PATH',
      };
    }

    // Try to add to PATH using PowerShell (persistent)
    try {
      const psCommand = `
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        $npmBin = "${npmBin.replace(/\\/g, '\\\\')}"
        if ($currentPath -notlike "*$npmBin*") {
          $newPath = $currentPath + ";" + $npmBin
          [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
          Write-Output "SUCCESS"
        } else {
          Write-Output "ALREADY_EXISTS"
        }
      `;
      
      const result = execSync(`powershell -Command "${psCommand}"`, { encoding: 'utf-8' }).trim();
      
      if (result === 'SUCCESS') {
        return {
          success: true,
          method: 'powershell-user',
          message: 'Added npm global bin to user PATH',
          requiresRestart: true,
        };
      } else if (result === 'ALREADY_EXISTS') {
        return {
          success: true,
          method: 'already-configured',
          message: 'npm global bin directory already in PATH',
        };
      }
    } catch (psError) {
      // Fallback: provide manual instructions
      return {
        success: false,
        method: 'manual-required',
        message: `Please add "${npmBin}" to your PATH manually`,
      };
    }

    return {
      success: false,
      method: 'unknown-error',
      message: 'Could not configure PATH automatically',
    };
  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `Windows PATH setup failed: ${(error as Error).message}`,
    };
  }
}

function setupMacPath(): PathSetupResult {
  try {
    // Get npm global bin directory
    const npmBin = execSync('npm bin -g', { encoding: 'utf-8' }).trim();
    
    // Check if already in PATH
    const currentPath = process.env.PATH || '';
    if (currentPath.includes(npmBin)) {
      return {
        success: true,
        method: 'already-configured',
        message: 'npm global bin directory already in PATH',
      };
    }

    const homeDir = os.homedir();
    const shellConfigFiles = [
      path.join(homeDir, '.zshrc'),
      path.join(homeDir, '.bash_profile'),
      path.join(homeDir, '.bashrc'),
    ];

    // Find existing shell config file or create .zshrc (default on macOS)
    let configFile = path.join(homeDir, '.zshrc');
    for (const file of shellConfigFiles) {
      if (fs.existsSync(file)) {
        configFile = file;
        break;
      }
    }

    // Check if PATH export already exists
    let configContent = '';
    if (fs.existsSync(configFile)) {
      configContent = fs.readFileSync(configFile, 'utf-8');
      if (configContent.includes(npmBin)) {
        return {
          success: true,
          method: 'already-configured',
          message: 'npm global bin directory already in shell config',
        };
      }
    }

    // Add PATH export to shell config
    const pathExport = `\n# Added by Nucleon CLI\nexport PATH="$PATH:${npmBin}"\n`;
    fs.appendFileSync(configFile, pathExport);

    return {
      success: true,
      method: 'shell-config',
      message: `Added PATH export to ${path.basename(configFile)}`,
      requiresRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `macOS PATH setup failed: ${(error as Error).message}`,
    };
  }
}

function setupLinuxPath(): PathSetupResult {
  try {
    // Get npm global bin directory
    const npmBin = execSync('npm bin -g', { encoding: 'utf-8' }).trim();
    
    // Check if already in PATH
    const currentPath = process.env.PATH || '';
    if (currentPath.includes(npmBin)) {
      return {
        success: true,
        method: 'already-configured',
        message: 'npm global bin directory already in PATH',
      };
    }

    const homeDir = os.homedir();
    const shellConfigFiles = [
      path.join(homeDir, '.bashrc'),
      path.join(homeDir, '.bash_profile'),
      path.join(homeDir, '.profile'),
    ];

    // Find existing shell config file or create .bashrc
    let configFile = path.join(homeDir, '.bashrc');
    for (const file of shellConfigFiles) {
      if (fs.existsSync(file)) {
        configFile = file;
        break;
      }
    }

    // Check if PATH export already exists
    let configContent = '';
    if (fs.existsSync(configFile)) {
      configContent = fs.readFileSync(configFile, 'utf-8');
      if (configContent.includes(npmBin)) {
        return {
          success: true,
          method: 'already-configured',
          message: 'npm global bin directory already in shell config',
        };
      }
    }

    // Add PATH export to shell config
    const pathExport = `\n# Added by Nucleon CLI\nexport PATH="$PATH:${npmBin}"\n`;
    fs.appendFileSync(configFile, pathExport);

    return {
      success: true,
      method: 'shell-config',
      message: `Added PATH export to ${path.basename(configFile)}`,
      requiresRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      method: 'error',
      message: `Linux PATH setup failed: ${(error as Error).message}`,
    };
  }
}

export function checkNucleonInPath(): boolean {
  try {
    execSync('nucleon --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function showPathInstructions(platform: string): void {
  console.log(chalk.bold('\n🔧 Manual PATH Setup Instructions\n'));

  switch (platform) {
    case 'win32':
      console.log(chalk.cyan('Windows:'));
      console.log('1. Press Win + R, type "sysdm.cpl" and press Enter');
      console.log('2. Click "Environment Variables"');
      console.log('3. Under "User variables", select "Path" and click "Edit"');
      console.log('4. Click "New" and add the npm global bin directory');
      console.log('5. Click "OK" to save');
      console.log(chalk.gray('\nOr run in PowerShell as Administrator:'));
      try {
        const npmBin = execSync('npm bin -g', { encoding: 'utf-8' }).trim();
        console.log(chalk.yellow(`$env:PATH += ";${npmBin}"`));
      } catch {}
      break;

    case 'darwin':
      console.log(chalk.cyan('macOS:'));
      console.log('Add this line to your shell config file (~/.zshrc or ~/.bash_profile):');
      try {
        const npmBin = execSync('npm bin -g', { encoding: 'utf-8' }).trim();
        console.log(chalk.yellow(`export PATH="$PATH:${npmBin}"`));
      } catch {}
      console.log('\nThen run: source ~/.zshrc');
      break;

    case 'linux':
      console.log(chalk.cyan('Linux:'));
      console.log('Add this line to your ~/.bashrc or ~/.profile:');
      try {
        const npmBin = execSync('npm bin -g', { encoding: 'utf-8' }).trim();
        console.log(chalk.yellow(`export PATH="$PATH:${npmBin}"`));
      } catch {}
      console.log('\nThen run: source ~/.bashrc');
      break;

    default:
      console.log(chalk.yellow('Please add the npm global bin directory to your PATH manually.'));
  }

  console.log();
}