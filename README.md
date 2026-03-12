# ⚡ Nucleon CLI

**The Ultimate Developer Workflow Engine**

Nucleon is a powerful CLI that unifies your entire development workflow - from project initialization to deployment. One tool to rule them all.

[![npm version](https://badge.fury.io/js/nucleon-cli.svg)](https://www.npmjs.com/package/nucleon-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Why Nucleon?

Tired of juggling dozens of CLI tools? Nucleon solves the 5 biggest developer pain points:

- ❌ **Repetitive project setup** → ✅ Smart project initialization with real framework installation
- ❌ **Messy commit messages** → ✅ AI-powered commit generation
- ❌ **Broken environments** → ✅ Comprehensive environment diagnostics
- ❌ **No project insights** → ✅ Deep codebase analysis and health reports
- ❌ **Too many tools** → ✅ One unified CLI for everything

## 🚀 Quick Start

```bash
# Install globally (one time)
npm install -g nucleon-cli

# Initialize a new project
nucleon init

# Analyze your project
nucleon analyze

# Deploy to Vercel
nucleon vercel deploy
```

## ✨ Features

### 🏗️ **Core Commands**
- **`nucleon init`** - Initialize projects with real framework installation (Next.js, React, Express, Python)
- **`nucleon doctor`** - Comprehensive environment health checks
- **`nucleon analyze`** - Deep project analysis with actionable insights
- **`nucleon commit`** - Generate intelligent commit messages

### 📊 **Project Visualization**
- **`nucleon structure`** - Beautiful project architecture visualization with dependency graphs
- **`nucleon config`** - Smart project configuration management

### 🚀 **Deployment**
- **`nucleon vercel`** - Clean Vercel deployment workflow with pre-flight checks

### 📈 **Analytics & Insights**
- **`nucleon stats`** - Project statistics and development metrics
- **`nucleon deps`** - Dependency analysis and security auditing
- **`nucleon summary`** - Daily development activity tracking

### ⚙️ **Workflow Tools**
- **`nucleon task`** - Lightweight task management
- **`nucleon git`** - Enhanced Git workflows with smart operations
- **`nucleon context`** - Project metadata and context management

### 🔌 **Extensibility**
- **`nucleon plugin`** - Plugin system for unlimited extensibility

## 📸 Screenshots

### Project Structure Visualization
```
🏗️  Project Structure

└── 📁 project
    ├── 📁 src
    │   ├── 📁 components
    │   │   ├── 🔷 Header.tsx
    │   │   └── 🔷 Footer.tsx
    │   └── 🔷 index.ts
    └── 📋 package.json

🔗 Dependency Graph Detected
💡 Architecture Insights
  • React architecture detected with component-based structure
  • Clean modular architecture with reasonable dependencies
```

### Smart Project Analysis
```
📊 Project Health Report

Language: TypeScript
Framework: Next.js
Files: 127
Lines of Code: 12,481
Test Coverage: ~85%

💡 Suggestions
  • Consider splitting Dashboard.tsx into smaller components
  • Excellent test coverage - keep it up!
```

## 🛠️ Installation & Setup

### Global Installation
```bash
npm install -g nucleon-cli
```

### Automatic Setup
Nucleon automatically sets up your environment on first install:
- ✅ Detects and installs Vercel CLI
- ✅ Configures optional development tools
- ✅ Provides guided onboarding

### Manual Setup
```bash
nucleon setup  # Run setup anytime
```

## 📚 Usage Examples

### Initialize a New Project
```bash
nucleon init
# Choose from: Next.js, React+Vite, Express API, Python FastAPI, CLI Tool
# Automatically installs dependencies and sets up Git
```

### Analyze Any Project
```bash
cd my-project
nucleon analyze
# Get insights on architecture, dependencies, and code health
```

### Deploy with Confidence
```bash
nucleon vercel deploy
# Smart pre-deployment checks
# Automatic framework detection
# Clean deployment workflow
```

### Daily Development Workflow
```bash
nucleon task add "Implement user auth"
nucleon git smart-commit
nucleon summary
```

## 🎯 Perfect For

- **Frontend Developers** - Next.js, React, Vue projects
- **Backend Developers** - Express, FastAPI, Node.js APIs  
- **Full-Stack Teams** - End-to-end project management
- **DevOps Engineers** - Deployment and environment management
- **Open Source Maintainers** - Project health and analytics

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
git clone https://github.com/yourusername/nucleon-cli
cd nucleon-cli
npm install
npm run build
npm link  # Test locally
```

## 📄 License

MIT © [Your Name]

## 🌟 Show Your Support

If Nucleon helps your workflow, please ⭐ star this repo!

---

**Made with ❤️ for developers who want to focus on building, not tooling.**