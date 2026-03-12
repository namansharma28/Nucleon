# ⚡ Nucleon CLI

**The Ultimate Developer Workflow Engine**

> One CLI to replace them all. Project initialization, code analysis, deployment, and complete workflow automation.

## 🚀 Installation

```bash
npm install -g nucleon-cli
```

[![npm version](https://img.shields.io/npm/v/nucleon-cli.svg)](https://www.npmjs.com/package/nucleon-cli)
[![npm downloads](https://img.shields.io/npm/dm/nucleon-cli.svg)](https://www.npmjs.com/package/nucleon-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/nucleon-cli.svg)](https://nodejs.org/)

## ⚡ Quick Start

```bash
# Install once, use everywhere
npm install -g nucleon-cli

# Initialize any project
nucleon init

# Analyze your codebase
nucleon analyze

# Deploy with confidence
nucleon vercel deploy
```

## 🎯 Why Nucleon?

Stop juggling 20+ CLI tools. Nucleon unifies your entire development workflow:

| Problem | Solution |
|---------|----------|
| ❌ Repetitive project setup | ✅ Smart initialization with real framework installation |
| ❌ Messy commit messages | ✅ AI-powered commit generation |
| ❌ Broken environments | ✅ Comprehensive health diagnostics |
| ❌ No project insights | ✅ Deep codebase analysis with actionable suggestions |
| ❌ Complex deployments | ✅ One-command deployment with pre-flight checks |

## ✨ Core Features

### 🏗️ **Smart Project Initialization**
```bash
nucleon init
```
- **Real framework installation** (Next.js, React+Vite, Express, FastAPI)
- **Automatic dependency setup**
- **Git initialization with best practices**
- **Environment configuration**

### 📊 **Intelligent Code Analysis**
```bash
nucleon analyze
```
- **Project health scoring**
- **Architecture visualization**
- **Dependency analysis**
- **Performance insights**
- **Security recommendations**

### 🚀 **Seamless Deployment**
```bash
nucleon vercel deploy
```
- **Pre-deployment validation**
- **Environment checks**
- **Automatic framework detection**
- **Deployment monitoring**

### ⚙️ **Complete Workflow Automation**
```bash
nucleon git smart-commit    # Intelligent commits
nucleon task add "Feature"  # Task management  
nucleon deps                # Security auditing
nucleon summary             # Development metrics
```

## 📸 Live Examples

### Project Structure Visualization
```
🏗️  Project Structure

└── 📁 my-app
    ├── 📁 src
    │   ├── 📁 components
    │   │   ├── 🔷 Header.tsx
    │   │   └── 🔷 Footer.tsx
    │   └── 🔷 index.ts
    └── 📋 package.json

🔗 Dependency Graph: 15 modules analyzed
💡 Insights: Clean React architecture detected
```

### Smart Health Analysis
```
📊 Project Health Report

Language: TypeScript    Framework: Next.js
Files: 127              Test Coverage: 85%
Lines: 12,481          Dependencies: 23

⚠️  Warnings
  • Large file: Dashboard.tsx (1,200 lines)
  
💡 Suggestions  
  • Split Dashboard into smaller components
  • Add integration tests for API routes
```

## 🔧 Environment Variables & Configuration

### Automatic Configuration
Nucleon handles most environment setup automatically during installation:

- **PATH Setup**: Adds npm global bin directory to your system PATH
- **Shell Integration**: Updates `.bashrc`, `.zshrc`, or `.bash_profile` on Unix systems
- **Windows Registry**: Configures user environment variables on Windows

### Manual Configuration (if needed)

If you encounter "command not found" errors, manually configure your environment:

#### Windows
```powershell
# Method 1: PowerShell (run as user)
$npmBin = npm bin -g
$env:PATH += ";$npmBin"

# Method 2: System Properties
# 1. Win + R → "sysdm.cpl" → Environment Variables
# 2. Edit user PATH variable
# 3. Add output of: npm bin -g
```

#### macOS/Linux
```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile
echo 'export PATH="$PATH:$(npm bin -g)"' >> ~/.bashrc
source ~/.bashrc

# Or manually add the npm global bin path:
export PATH="$PATH:/usr/local/lib/node_modules/.bin"
```

### Project Environment Variables

When initializing projects, Nucleon creates appropriate `.env` files:

```bash
# Express API projects get .env.example with:
PORT=3000
NODE_ENV=development

# Vercel deployments may need:
VERCEL_TOKEN=your_token_here
```

### Troubleshooting

If Nucleon isn't working after installation:

1. **Check installation**: `nucleon --version`
2. **Run diagnostics**: `nucleon doctor`
3. **Reconfigure PATH**: `nucleon setup`
4. **Manual setup**: Follow platform-specific instructions above

## 📚 Command Reference

| Command | Description |
|---------|-------------|
| `nucleon init` | Initialize projects with framework installation |
| `nucleon analyze` | Deep project analysis and health check |
| `nucleon structure` | Visualize project architecture |
| `nucleon vercel` | Clean deployment workflow |
| `nucleon doctor` | Environment diagnostics |
| `nucleon git` | Enhanced Git operations |
| `nucleon task` | Lightweight task management |
| `nucleon stats` | Development metrics |
| `nucleon update` | Auto-update to latest version |

## 🎯 Perfect For

- **🎨 Frontend Developers** - React, Next.js, Vue projects
- **⚙️ Backend Engineers** - Express, FastAPI, Node.js APIs
- **🚀 Full-Stack Teams** - End-to-end project management
- **☁️ DevOps Engineers** - Deployment automation
- **📦 Open Source Maintainers** - Project health monitoring

## 🌟 What Makes Nucleon Special

- **🔄 Universal** - Works in any directory, adapts to any project
- **🧠 Intelligent** - Context-aware commands that understand your project
- **⚡ Fast** - Optimized for developer productivity
- **🔌 Extensible** - Plugin system for custom workflows
- **🎨 Beautiful** - Clean, colorful output that's easy to read
- **🔄 Auto-updating** - Always stay on the latest version

## 🛠️ Getting Started

### 1. Install Globally
```bash
npm install -g nucleon-cli
```

### 2. Automatic Setup
Nucleon automatically configures your development environment:
- ✅ Sets up PATH for global access
- ✅ Installs Vercel CLI for deployments
- ✅ Configures optional dev tools (TypeScript, ESLint, Prettier)

### 3. Manual Environment Setup (if needed)

If automatic setup fails, you can manually configure environment variables:

**Windows:**
1. Open System Properties → Environment Variables
2. Add npm global bin directory to user PATH:
   ```cmd
   # Get npm global bin path
   npm bin -g
   # Add the returned path to your PATH environment variable
   ```

**macOS/Linux:**
Add to your shell config file (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):
```bash
# Add npm global bin to PATH
export PATH="$PATH:$(npm bin -g)"
```

**Environment Variables for Projects:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `VERCEL_TOKEN`: For automated deployments
- Project-specific variables in `.env` files

### 4. Start Using
```bash
nucleon init     # Create a new project
nucleon doctor   # Check your environment
nucleon analyze  # Analyze any existing project
```

## 🤝 Contributing

We welcome contributions! Check out our [Contributing Guide](CONTRIBUTING.md).

```bash
git clone https://github.com/nucleon-cli/nucleon
cd nucleon
npm install && npm run build
npm link  # Test locally
```

## 📄 License

MIT © Nucleon Team

## 🌟 Support

If Nucleon improves your workflow, please:
- ⭐ **Star this repo**
- 🐦 **Share on Twitter**
- 📝 **Write a review**

---

**Built with ❤️ for developers who want to focus on building, not tooling.**