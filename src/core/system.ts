import { execSync } from 'child_process';

export function checkCommand(command: string): boolean {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function checkService(service: string): boolean {
  // Placeholder for service checks (MongoDB, Redis, etc.)
  return false;
}
