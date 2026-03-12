#!/usr/bin/env node
import { postInstallSetup } from './commands/setup';

// Run post-install setup
postInstallSetup().catch(error => {
  console.error('Post-install setup failed:', error.message);
  process.exit(0); // Don't fail the installation
});