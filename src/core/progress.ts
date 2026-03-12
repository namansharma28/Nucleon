import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class ProgressBar {
  private current: number = 0;
  private total: number = 100;
  private width: number = 30;
  private spinner?: Ora;

  constructor(total: number = 100, width: number = 30) {
    this.total = total;
    this.width = width;
  }

  start(message: string): void {
    this.spinner = ora(message).start();
  }

  update(current: number, message?: string): void {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const empty = this.width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const display = `[${chalk.green(bar)}] ${percentage}%`;

    if (this.spinner) {
      this.spinner.text = `${display} ${message || ''}`;
    }
  }

  succeed(message: string): void {
    if (this.spinner) {
      this.spinner.succeed(`${message} ${chalk.gray(`(${this.formatTime()})`)}`);
    }
  }

  fail(message: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
    }
  }

  private formatTime(): string {
    // Simple time formatting - could be enhanced with actual timing
    return 'completed';
  }
}

export class MultiStepProgress {
  private steps: Array<{ name: string; completed: boolean; current?: boolean }> = [];
  private currentStepIndex: number = 0;
  private startTime: number = Date.now();

  constructor(steps: string[]) {
    this.steps = steps.map((name, index) => ({
      name,
      completed: false,
      current: index === 0,
    }));
  }

  start(): void {
    this.showProgress();
  }

  nextStep(message?: string): void {
    if (this.currentStepIndex < this.steps.length) {
      this.steps[this.currentStepIndex].completed = true;
      this.steps[this.currentStepIndex].current = false;
    }

    this.currentStepIndex++;

    if (this.currentStepIndex < this.steps.length) {
      this.steps[this.currentStepIndex].current = true;
    }

    this.showProgress(message);
  }

  complete(message: string): void {
    // Mark all steps as completed
    this.steps.forEach(step => {
      step.completed = true;
      step.current = false;
    });

    const duration = Math.round((Date.now() - this.startTime) / 1000);
    console.log(chalk.green('✅'), `${message} ${chalk.gray(`in ${duration}s`)}`);
  }

  fail(message: string): void {
    console.log(chalk.red('❌'), message);
  }

  private showProgress(message?: string): void {
    // Clear previous lines
    if (this.currentStepIndex > 0) {
      process.stdout.write('\x1b[2K\r'); // Clear current line
    }

    this.steps.forEach((step, index) => {
      let icon = '○';
      let color = chalk.gray;

      if (step.completed) {
        icon = '✅';
        color = chalk.green;
      } else if (step.current) {
        icon = '🔄';
        color = chalk.yellow;
      }

      const stepText = color(`${icon} ${step.name}`);
      
      if (index === 0 || step.completed || step.current) {
        console.log(`  ${stepText}`);
      }
    });

    if (message) {
      console.log(chalk.gray(`    ${message}`));
    }
  }
}

export function createProgressBar(total: number, message: string): ProgressBar {
  const progress = new ProgressBar(total);
  progress.start(message);
  return progress;
}

export function createMultiStepProgress(steps: string[]): MultiStepProgress {
  return new MultiStepProgress(steps);
}

// Utility functions for common progress patterns
export async function withProgress<T>(
  promise: Promise<T>,
  message: string,
  successMessage?: string
): Promise<T> {
  const spinner = ora(message).start();
  
  try {
    const result = await promise;
    spinner.succeed(successMessage || 'Completed');
    return result;
  } catch (error) {
    spinner.fail(`Failed: ${(error as Error).message}`);
    throw error;
  }
}

export function simulateProgress(
  duration: number,
  message: string,
  onComplete: () => void
): void {
  const progress = new ProgressBar(100);
  progress.start(message);

  const interval = duration / 100;
  let current = 0;

  const timer = setInterval(() => {
    current += 1;
    progress.update(current);

    if (current >= 100) {
      clearInterval(timer);
      progress.succeed('Completed');
      onComplete();
    }
  }, interval);
}