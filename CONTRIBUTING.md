# Contributing to Nucleon CLI

Thank you for your interest in contributing to Nucleon! 🎉

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/namasharma28/nucleon
   cd nucleon
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Build and test**
   ```bash
   npm run build
   npm link  # Test locally
   ```

## 🛠️ Development Workflow

### Project Structure
```
src/
├── commands/     # All CLI commands
├── core/         # Core utilities and logic
└── index.ts      # Main CLI entry point
```

### Adding a New Command

1. **Create command file**: `src/commands/mycommand.ts`
2. **Implement the command**:
   ```typescript
   import chalk from 'chalk';
   
   export async function myCommand() {
     console.log(chalk.green('Hello from my command!'));
   }
   ```
3. **Register in main CLI**: Add to `src/index.ts`
4. **Build and test**: `npm run build && nucleon mycommand`

### Code Style

- Use **TypeScript** for all new code
- Follow existing **naming conventions**
- Add **error handling** for all operations
- Use **chalk** for colored output
- Use **ora** for loading spinners
- Use **inquirer** for interactive prompts

## 🎯 Areas We Need Help

- **New Commands** - Add more developer workflow tools
- **Plugin System** - Expand the plugin ecosystem
- **Documentation** - Improve guides and examples
- **Testing** - Add comprehensive test coverage
- **Platform Support** - Windows/Mac/Linux compatibility

## 🐛 Bug Reports

Please include:
- **OS and Node.js version**
- **Nucleon version** (`nucleon --version`)
- **Steps to reproduce**
- **Expected vs actual behavior**

## 💡 Feature Requests

We love new ideas! Please:
- **Check existing issues** first
- **Describe the use case** clearly
- **Explain why it fits** Nucleon's philosophy

## 📝 Pull Request Process

1. **Create a feature branch**
2. **Make your changes**
3. **Test thoroughly**
4. **Update documentation** if needed
5. **Submit PR with clear description**

## 🌟 Recognition

All contributors will be:
- **Listed in README**
- **Credited in releases**
- **Invited to maintainer discussions**

---

**Let's build the ultimate developer CLI together!** 🚀