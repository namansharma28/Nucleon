# ⚡ Nucleon CLI

**The Ultimate Developer Workflow Engine**

> One CLI to replace them all. Project initialization, code analysis, deployment, and complete workflow automation.

[![npm version](https://img.shields.io/npm/v/nucleon-cli.svg)](https://www.npmjs.com/package/nucleon-cli)
[![npm downloads](https://img.shields.io/npm/dm/nucleon-cli.svg)](https://www.npmjs.com/package/nucleon-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/nucleon-cli.svg)](https://nodejs.org/)

## 🎯 Why Nucleon?

Stop juggling 20+ CLI tools. Nucleon unifies your entire development workflow:

| Problem | Solution |
|---------|----------|
| ❌ Repetitive project setup | ✅ Smart initialization with real framework installation |
| ❌ Messy commit messages | ✅ AI-powered commit generation |
| ❌ Broken environments | ✅ Comprehensive health diagnostics |
| ❌ No project insights | ✅ Deep codebase analysis with actionable suggestions |
| ❌ Complex deployments | ✅ One-command deployment with pre-flight checks |

## 🚀 Quick Start

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

## 🛠️ Installation

### Global Installation (Recommended)
```bash
npm install -g nucleon-cli
```

### Automatic Environment Setup
Nucleon automatically configures your development environment:
- ✅ Installs Vercel CLI for deployments
- ✅ Configures optional dev tools (TypeScript, ESLint, Prettier)
- ✅ Sets up project templates and configurations

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
| `nucleon setup` | Configure development environment |

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