import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  created: string;
  completed?: string;
}

const TASKS_FILE = '.nucleon-tasks.json';

function loadTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function taskCommand(action?: string, ...args: string[]) {
  const tasks = loadTasks();

  switch (action) {
    case 'add':
      await addTask(args.join(' '));
      break;
    case 'list':
      listTasks();
      break;
    case 'done':
      await markDone(parseInt(args[0]));
      break;
    case 'remove':
      await removeTask(parseInt(args[0]));
      break;
    case 'start':
      await startTask(parseInt(args[0]));
      break;
    default:
      await interactiveTaskManager();
  }
}

async function addTask(title: string) {
  if (!title.trim()) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Task description:',
        validate: (input) => input.trim() ? true : 'Task description is required',
      },
    ]);
    title = answers.title;
  }

  const tasks = loadTasks();
  const newTask: Task = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    status: 'todo',
    created: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);
  
  console.log(chalk.green('✔'), `Task added: ${title}`);
}

function listTasks() {
  const tasks = loadTasks();
  
  if (tasks.length === 0) {
    console.log(chalk.yellow('No tasks found'));
    return;
  }

  console.log(chalk.bold('\n📋 Tasks\n'));

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (todoTasks.length > 0) {
    console.log(chalk.bold('📝 To Do'));
    todoTasks.forEach(task => {
      console.log(`  ${task.id}. ${task.title}`);
    });
    console.log();
  }

  if (inProgressTasks.length > 0) {
    console.log(chalk.bold('🚧 In Progress'));
    inProgressTasks.forEach(task => {
      console.log(`  ${task.id}. ${chalk.yellow(task.title)}`);
    });
    console.log();
  }

  if (doneTasks.length > 0) {
    console.log(chalk.bold('✅ Completed'));
    doneTasks.slice(-5).forEach(task => {
      console.log(`  ${task.id}. ${chalk.green(task.title)} ${chalk.gray('(' + new Date(task.completed!).toLocaleDateString() + ')')}`);
    });
    console.log();
  }

  console.log(chalk.cyan('Total:'), `${tasks.length} tasks (${todoTasks.length} todo, ${inProgressTasks.length} in progress, ${doneTasks.length} done)`);
}

async function markDone(id: number) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    console.log(chalk.red('Task not found'));
    return;
  }

  task.status = 'done';
  task.completed = new Date().toISOString();
  saveTasks(tasks);

  console.log(chalk.green('✔'), `Task completed: ${task.title}`);
}

async function startTask(id: number) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    console.log(chalk.red('Task not found'));
    return;
  }

  task.status = 'in-progress';
  saveTasks(tasks);

  console.log(chalk.yellow('🚧'), `Started working on: ${task.title}`);
}

async function removeTask(id: number) {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    console.log(chalk.red('Task not found'));
    return;
  }

  const task = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  saveTasks(tasks);

  console.log(chalk.red('✖'), `Task removed: ${task.title}`);
}

async function interactiveTaskManager() {
  const tasks = loadTasks();
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Add new task',
        'List all tasks',
        'Mark task as done',
        'Start working on task',
        'Remove task',
        'Exit',
      ],
    },
  ]);

  switch (answers.action) {
    case 'Add new task':
      await addTask('');
      break;
    case 'List all tasks':
      listTasks();
      break;
    case 'Mark task as done':
      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks available'));
        break;
      }
      const doneAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'taskId',
          message: 'Which task to mark as done?',
          choices: tasks.filter(t => t.status !== 'done').map(t => ({
            name: `${t.id}. ${t.title}`,
            value: t.id,
          })),
        },
      ]);
      await markDone(doneAnswers.taskId);
      break;
    case 'Start working on task':
      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks available'));
        break;
      }
      const startAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'taskId',
          message: 'Which task to start?',
          choices: tasks.filter(t => t.status === 'todo').map(t => ({
            name: `${t.id}. ${t.title}`,
            value: t.id,
          })),
        },
      ]);
      await startTask(startAnswers.taskId);
      break;
    case 'Remove task':
      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks available'));
        break;
      }
      const removeAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'taskId',
          message: 'Which task to remove?',
          choices: tasks.map(t => ({
            name: `${t.id}. ${t.title}`,
            value: t.id,
          })),
        },
      ]);
      await removeTask(removeAnswers.taskId);
      break;
  }
}